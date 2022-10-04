

/**
 * Un utilisateur de la plateforme.
 */
export interface IUser {
  /** ID Unique */
  userId: number;
  /** Nom de famille */
  familyName?: string;
  /** Prénom */
  givenName?: string;
  /** Adress e-mail, ceci doit être unique est sera utilisé comme identifiant pour l'utilisateur */
  email: string;
  /** Solde */
  balance: number;
}

export type IUserCreate = Omit<IUser, 'userId'>;
export type IUserUpdate = Partial<IUserCreate>;
export type IUserRO = Readonly<IUser>;