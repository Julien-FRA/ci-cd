import { Body, Delete, Get, Path, Post, Put, Query, Route, Security } from 'tsoa';
import { Crud } from '../../classes/Crud';
import { ICreateResponse } from '../../types/api/ICreateResponse';
import { IIndexResponse } from '../../types/api/IIndexQuery';
import { IUpdateResponse } from '../../types/api/IUpdateResponse';
import { ISport, ISportCreate, ISportUpdate } from '../../types/tables/sport/ISport';

const READ_COLUMNS = ['sportId', 'category'];

@Route("/sport")
export class SportController {
  /**
   * Récupérer une page d'utilisateurs.
   */
   @Get()
   public async getSports(
    /** La page (zéro-index) à récupérer */
    @Query() page?: number,    
    /** Le nombre d'éléments à récupérer (max 50) */
    @Query() limit?: number,    
   ): Promise<IIndexResponse<ISport>> {    
     return Crud.Index<ISport>({ page, limit }, 'sport', READ_COLUMNS);
   }
 
   /**
    * Créer un nouvel utilisateur
    */
   @Post()
   public async createSport(
     @Body() body: ISportCreate
   ): Promise<ICreateResponse> {
     return Crud.Create<ISportCreate>(body, 'sport');
   }
}