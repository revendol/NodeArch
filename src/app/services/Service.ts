import Repo from '../db/repos/Repo';
import {Document, FilterQuery} from 'mongoose';
import logger from "../util/logger";

class Service<T extends Document> {
  public Repo: Repo<T>;

  constructor(Repo: Repo<T>) {
    this.Repo = Repo;
  }

  public async all(): Promise<T[]> {
    logger.info('Fetching all documents', {service: this.constructor.name});
    return this.Repo.all();
  }

  public async add(data: Partial<T>): Promise<boolean> {
    logger.info('Adding new document', {service: this.constructor.name});
    return this.Repo.add(data);
  }

  public async addAndReturn(data: Partial<T>): Promise<T> {
    logger.info('Adding new document and returning', {service: this.constructor.name});
    const document = await this.Repo.addAndReturn(data);
    if (!document) {
      logger.error('Document creation failed', {service: this.constructor.name});
      throw new Error('Document creation failed');
    }
    logger.info('Document created successfully', {service: this.constructor.name});
    return document;
  }

  public async single(id: string): Promise<T | null> {
    logger.info('Fetching single document', {service: this.constructor.name});
    return this.Repo.single(id);
  }

  public async singleByField(data: FilterQuery<T>): Promise<T | null> {
    logger.info('Fetching single document by field', {service: this.constructor.name});
    return this.Repo.singleByField(data);
  }

  public async allByField(data: FilterQuery<T>): Promise<T[]> {
    logger.info('Fetching all documents by field', {service: this.constructor.name});
    return this.Repo.allByField(data);
  }

  public async update(filter: FilterQuery<T>, data: Partial<T>): Promise<boolean> {
    logger.info('Updating document', {service: this.constructor.name});
    return this.Repo.update(filter, data);
  }

  public async bulkInsert(data: Partial<T>[]): Promise<T[]> {
    logger.info('Bulk inserting documents', {service: this.constructor.name});
    return this.Repo.bulkInsert(data);
  }

  public async destroy(data: FilterQuery<T>): Promise<boolean> {
    logger.info('Destroying document', {service: this.constructor.name});
    const exists = await this.Repo.singleByField(data);
    if (!exists) {
      logger.error('Document not found', {service: this.constructor.name});
      return false;
    }
    logger.info('Document found, destroying', {service: this.constructor.name, data});
    return this.Repo.destroy(data);
  }

  public async destroyAllByField(data: FilterQuery<T>): Promise<boolean> {
    logger.info('Destroying all documents by field', {service: this.constructor.name, data});
    return this.Repo.destroyAllByField(data);
  }
}

export default Service;
