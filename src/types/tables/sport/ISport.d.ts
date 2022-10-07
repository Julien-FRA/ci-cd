/**
 * Un sport.
 */
 export interface ISport {
    /** ID Unique */
    sportId: number;
    /** Nom de famille */
    category?: string;
  }
  
  export type ISportCreate = Omit<ISport, 'sportId'>;
  export type ISportUpdate = Partial<ISportCreate>;
  export type ISportRO = Readonly<ISport>;