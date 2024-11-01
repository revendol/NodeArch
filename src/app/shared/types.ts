// **** Express **** //
export interface IFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  filename: string;
  size: number;
}

export interface IKey {
  publicKey: string;
  privateKey: string;
}