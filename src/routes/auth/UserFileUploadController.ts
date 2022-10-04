import { Route, Security, Post, Request, Path, Middlewares, Get, Query, SuccessResponse } from 'tsoa';
import express from "express";
import multer from "multer";
import { ApiError } from '../../classes/Errors/ApiError';
import { ErrorCode } from '../../classes/Errors/ErrorCode';
import { v4 } from 'uuid';
import { Crud } from '../../classes/Crud';
import { IUserFileCreate, IUserFile } from '../../types/tables/user/IUserFile';
import { ICreateResponse } from '../../types/api/ICreateResponse';
import { NoSuchKey } from '@aws-sdk/client-s3';
import { ObjectStorage } from '../../classes/ObjectStorage';
import { IIndexResponse } from '../../types/api/IIndexQuery';



/**
 * Controller pour le téléchargement des fichiers concernant un utilisateur
 */
@Route("/auth/user/{userId}/file")
@Security('jwt')
export class UserFileController {

  /**
   * Envoyer un fichier
   * @param userId Le ID de l'utilisateur
   */
  @Post()
  @Middlewares(multer().single("file"))
  public async uploadFile(@Path() userId: number, @Request() request: express.Request): Promise<ICreateResponse> {
    
    if (!request.file) {
      throw new ApiError(ErrorCode.BadRequest, 'object/invalid-multipart', 'Missing file data in multi-part upload');
    }

    const filename = (request.file.filename || request.file.originalname || v4());
    const storageKey =  `user/${userId}/${filename}`;

    await ObjectStorage.upload(
      request.file.buffer,
      storageKey,
      request.file.mimetype,          
    )

    const result = await Crud.Create<IUserFileCreate>({
      userId,
      storageKey,
      filename,
      mimeType: request.file.mimetype
    }, 'user_file');

    return result;
  } 

  /**
   * Récupérer une liste de fichiers d'un utilisateur
   */
  @Get()
  public async showFiles(
    @Path() userId: number,
    /** La page (zéro-index) à récupérer */
    @Query() page?: number,    
    /** Le nombre d'éléments à récupérer (max 50) */
    @Query() limit?: number,    
  ): Promise<IIndexResponse<IUserFile>> {
    return Crud.Index<IUserFile>({ page, limit }, 'user_file', ['fileId', 'userId', 'storageKey', 'mimeType'], { userId });
  }

  /**
   * Récupérer un fichier selon son ID. Le résultat est une série de messages (statut 200) contenant les contenus du fichier.
   */
  @Get("{fileId}")
  @SuccessResponse("200", "Chunked object stream") // Custom success response
  public async downloadFile(@Path() fileId: number, @Request() request: express.Request) {
    
    const response = request.res;
    if (!response) {
      throw new ApiError(ErrorCode.InternalError, 'object/invalid-response', "A response object was not available")
    }

    // D'abord, récupérer la ligne dans la table, afin de récupérer la clé du stockage objet
    const file = await Crud.Read<IUserFile>(
      'user_file',
      'fileId',
      fileId,
      ['fileId', 'storageKey', 'mimeType']
    );
     
    // Ensuite lancer et streamer la réponse
    await new Promise<void>(
      async (resolve, reject) => {
        try {
          const stream = await ObjectStorage.download(file.storageKey);
          request.res!.writeHead(200, {
            'Content-Type': file.mimeType || 'application/octet-stream',
            'Transfer-Encoding': 'chunked'
          });
          stream.on('data', (chunk) => { response.write(chunk); });
          stream.on('error', (err) => {
            throw(err);
          });
          stream.on('end', () => {
            response.end();
            resolve();
          })

        } catch (err) {
          if (err instanceof NoSuchKey) {
            reject(new ApiError(ErrorCode.InternalError, 'object/key-not-found-in-storage', 'Key not found in storage', { key: file.storageKey }));
          } else {
            reject(err)
          }          
        }
      }
    )
   

    
  }
}