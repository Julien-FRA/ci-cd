/**
 * Une vue d'une publicité
 */
 export interface IAdvertView {
  /** ID Unique */
  advertViewId: number;  
  /** ID de la publicité en question */
  advertId: number;
  /** ID de l'éditeur chez qui la pub s'est affichée */
  publisherId: number;
  /** ID du propriétaire de la pub */
  advertiserId: number;
  /** ID de l'utilisateur qui a vu la pub */
  userId: number;
  /** Le montant total de la transaction */
  total: number;
  /** Le montant facturé à l'annonceur */
  advertiserDebit: number;
  /** La partie payée à l'éditeur */
  publisherCredit: number;
  /** La partie payée à l'utilisateur */
  userCredit: number;  
}

export type IAdvertViewCreate = Omit<IAdvertView, 'advertViewId'>;
export type IAdvertViewUpdate = Partial<IAdvertViewCreate>;
export type IAdvertViewRO = Readonly<IAdvertView>;
