import 'express';

// **** Declaration Merging **** //

declare module 'express' {

  export interface Request {
    token?: {
      name: string;
      email: string;
      role: string;
    };
  }
}
