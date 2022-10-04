/**
 * Un  annonceur de publicité
 */
 export interface IAdvertiser {
  /** ID Unique */
  advertiserId: number;
  /** Nom */
  name: string;
  /** Solde */
  balance: number;
}

export type IAdvertiserCreate = Omit<IAdvertiser, 'advertiserId'>;
export type IAdvertiserUpdate = Partial<IAdvertiserCreate>;
export type IAdvertiserRO = Readonly<IAdvertiser>;
