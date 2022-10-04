/**
 * Une publicité
 */
 export interface IAdvert {
  /** ID Unique */
  advertId: number;  
  /** ID de l'annonceur à qui cette publicité appartient */
  advertiserId: number;
  /** Prix */
  price: number;
}

export type IAdvertCreate = Omit<IAdvert, 'advertId'>;
export type IAdvertUpdate = Partial<IAdvertCreate>;
export type IAdvertRO = Readonly<IAdvert>;
