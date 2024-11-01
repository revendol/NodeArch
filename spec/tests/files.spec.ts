import supertest from 'supertest';
import StatusCodes from 'http-status-codes';
import { SuperTest, Test, Response } from 'supertest';
import fs from 'fs';
import path from "path";
import app from '@server';
import fileRepo from '../../src/app/db/repos/file-repo';
import File, { IFile } from '../../src/app/db/models/file-model';
import { pErr } from '../../src/app/shared/functions';
import { p as filePaths } from '../../src/app/http/routes/file-router';
import { ParamMissingError, FileNotFoundError, ValidatorFnError } from '../../src/app/shared/errors';
import {success} from "../../src/app/shared/response";


// **** Variables **** //

// Misc
const filesPath = ('/api' + filePaths.basePath),
  uploadFilesPath = `${filesPath}${filePaths.uploadFiles}`,
  downloadExistingFilesPath = `${filesPath}${filePaths.downloadExistingFiles}`,
  deleteExistingFilesPath = `${filesPath}${filePaths.deleteExistingFiles}`,
  { BAD_REQUEST, CREATED, OK } = StatusCodes;

// Dummy users for GET req
const dummyFileData = [
  File.new([
      "files-1679825633401-985751943.csv"
    ],
    "MFwwDQYJKoZIhvcNAQEBBQADSwAwSAJBAMVAbUKskjGpCeyhVmCmXILvpjDAzrvkoCICLZCQVCIsTtuMptpMooZibBFUkSGDhgvKINWrkUCAwEAAQ",
    "MIIBvTBXBgkqhkiGwBBQwSjApBgkqhkiGwBBQwwHAQIxGWjMCAggAMAwGCCqGSIbDQIJBQAwHQYJYIZIAWUDBAEqBBAAJdbMlNpcGCXPbLBIIBYAoxNRGvABfDBSxnMsXRZlfUmMlJcHFOVcnkwoCBllikVWCwFlTLJaNaCrsGmAJKtyQOmEaEeBmzpkeLQqpTYEmGQASrjKfaPaBSQHNHTTwfiNjKBRKAgckAgWTBwXHpbngmFOLPHBCmDAiXJNjhaqfBzhwGxLebOsDvDXoxYevRKOchPQSYPJTogyljGYtiVAMQBZntvgnqmBWLdAXKUveXdbDbwpRZnABNKZUouXnUqXJfwNYQHlMjUfgArQxszhinwBnvThCAVJDWfmJgxPJdRrQZJILRsfevDOiJofpXbsebTFTVZaIxKAGzbXzPZomHMXjYSmkFydFjrAHCPLqHgBUuhnPnkinfunYdCqVrNFJCBEiEddhKYfJVDsMzawDKY",
    "2023-03-21T10:19:21.444Z"
)
] as const;

// **** Types **** //

type TReqBody = string | object | undefined;


// **** Tests **** //

describe('file-router', () => {

  let agent: SuperTest<Test>;

  // Run before all tests
  beforeAll((done) => {
    agent = supertest.agent(app);
    done();
  });

  // Test get users
  describe(`"POST:${uploadFilesPath}"`, () => {
    const callApi = () =>
      agent.post(uploadFilesPath);
    // Upload file
    it("It should return bad request with 400 status code without file", (done) => {
      // Call API
      callApi().end((err: Error, res: Response) => {
        pErr(err);
        expect(res.status).toBe(BAD_REQUEST);
        expect(res.body.success).toBe(false);
        done();
      });
    });
    it("It should upload file and get status code 200", (done)=>{
      const filePath = path.join(__dirname,'../support/test.csv');
      callApi()
        .set('content-type', 'multipart/form-data')
        .attach('files',fs.readFileSync(filePath),'spec/test.csv')
        .end((err: Error, res: Response)=>{
          pErr(err);
          expect(res.body.success).toBe(true);
          expect(res.status).toBe(OK);
          done();
        });
    });
  });
  describe(`"GET:${downloadExistingFilesPath}"`,()=>{
    const callApi = () =>
      agent.get(`${downloadExistingFilesPath}/${dummyFileData[0].publicKey}`);
    it("It should download file",(done)=>{
      callApi().end((err: Error, res: Response) => {
        pErr(err);
        expect(res.status).toBe(OK);
        done();
      });
    });

  });
  describe(`"DELETE:${deleteExistingFilesPath}"`,()=>{
    const callApi = () =>
      agent.delete(`${deleteExistingFilesPath}/${dummyFileData[0].privateKey}`);
    it("It should delete file",(done)=>{
      callApi().end((err: Error, res: Response) => {
        pErr(err);
        expect(res.status).toBe(OK);
        done();
      });
    });

  });
});
