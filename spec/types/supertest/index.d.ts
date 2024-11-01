import {IKey} from "../../../src/app/shared/types";
import 'supertest';


declare module 'supertest' {

  export interface Response  {
    headers: Record<string, string[]>;
    body: {
      success: boolean;
      errors?: string;
      message?: number|string;
      data: IKey;
    };
  }
}