export type StructuredErrors = 
  // SQL
  'sql/failed' |  
  'sql/not-found' |

  // Crud
  'validation/failed' | 
    
  // Authorization
  'auth/missing-header' |
  'auth/unknown-email' |

  // Files
  'object/invalid-multipart' |
  'object/error-transmitting' |
  'object/invalid-response' |
  'object/key-not-found-in-storage' |

  // Default
  'internal/unknown' |

  // Advertiser
  'advertiser/insufficient-credit'
;