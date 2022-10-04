export interface IUserFile {
  fileId: number;
  userId: number;
  storageKey: string;
  filename?: string;
  mimeType?: string;
}

export type IUserFileCreate = Omit<IUserFile, 'fileId'>;
export type IUserFileUpdate = Partial<IUserFileCreate>;
export type IUserFileRO = Readonly<IUserFile>;