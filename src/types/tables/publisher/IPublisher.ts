/**
 * Un éditeur
 */
 export interface IPublisher {
  /** ID Unique */
  publisherId: number;
  /** Nom */
  name: string;
  /** Solde */
  balance: number;
}

export type IPublisherCreate = Omit<IPublisher, 'publisherId'>;
export type IPublisherUpdate = Partial<IPublisherCreate>;
export type IPublisherRO = Readonly<IPublisher>;
