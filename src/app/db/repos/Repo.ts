import {Model, Document, FilterQuery} from 'mongoose';
import logger from "../../util/logger";

class Repo<T extends Document> {
  private model: Model<T>;

  constructor(model: Model<T>) {
    this.model = model;
  }

  public async add(data: Partial<T>): Promise<boolean> {
    const outcome = await new this.model(data).save();
    logger.info('Document created successfully', {repo: this.constructor.name});
    return !!outcome;
  }

  public async addAndReturn(data: Partial<T>): Promise<T | null> {
    logger.info('Adding new document and returning', {repo: this.constructor.name});
    return await new this.model(data).save();
  }

  public async exist(id: string): Promise<boolean> {
    logger.info('Checking if document exists', {repo: this.constructor.name, id});
    const entity = await this.model.findById(id);
    return !!entity;
  }

  public async single(id: string): Promise<T | null> {
    logger.info('Fetching single document', {repo: this.constructor.name, id});
    return (await this.model.findById(id));
  }

  public async singleByField(filter: FilterQuery<T>): Promise<T | null> {
    logger.info('Fetching single document by field', {repo: this.constructor.name, filter});
    return await this.model.findOne(filter)
      .select('-__v -_id')
      .lean<T>()
      .exec();
  }

  public async allByField(filter: FilterQuery<T>): Promise<T[]> {
    logger.info('Fetching all documents by field', {repo: this.constructor.name, filter});
    return (await this.model
      .find(filter)
      .select('-__v')
      .sort({createdAt: 'desc'}));
  }

  public async all(): Promise<T[]> {
    logger.info('Fetching all documents', {repo: this.constructor.name});
    return (await this.model.find().select('-__v').sort({createdAt: 'desc'}));
  }

  public async update(filter: FilterQuery<T>, data: Partial<T>): Promise<boolean> {
    logger.info('Updating document', {repo: this.constructor.name, filter, data});
    const updatedEntity = await this.model
      .findOneAndUpdate(filter, {$set: data}, {new: true}).exec();
    logger.info('Document updated successfully', {repo: this.constructor.name});
    return !!updatedEntity;
  }

  public async bulkInsert(data: Partial<T>[]): Promise<T[]> {
    logger.info('Bulk inserting documents', {repo: this.constructor.name});
    const insertedDocuments = await this.model.insertMany(data) as unknown as T[];
    logger.info('Documents inserted successfully', {repo: this.constructor.name});
    return insertedDocuments;
  }

  public async destroy(filter: FilterQuery<T>): Promise<boolean> {
    logger.info('Destroying document', {repo: this.constructor.name, filter});
    const result = await this.model.deleteOne(filter);
    if (result.deletedCount === 0) {
      logger.error('Document not found', {repo: this.constructor.name});
      return false;
    }
    logger.info('Document destroyed successfully', {repo: this.constructor.name});
    return result.deletedCount > 0;
  }

  public async destroyAllByField(filter: FilterQuery<T>): Promise<boolean> {
    logger.info('Destroying all documents by field', {repo: this.constructor.name, filter});
    const result = await this.model.deleteMany(filter);
    if (result.deletedCount === 0) {
      logger.error('Documents not found', {repo: this.constructor.name});
      return false;
    }
    logger.info('Documents destroyed successfully', {repo: this.constructor.name});
    return result.deletedCount > 0;
  }
}

export default Repo;