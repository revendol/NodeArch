import { Request, Response } from 'express';
import logger from "@util/logger";
import { StatusCodes } from 'http-status-codes';
import { ValidationType } from '@validators/Validators';
import ErrorMessage from "@shared/errorMessage";

interface IService<T> {
  addAndReturn(data: Partial<T>): Promise<T>;
  all(): Promise<T[]>;
  singleByField(filter: Partial<T>): Promise<T | null>;
  update(filter: Partial<T>, data: Partial<T>): Promise<boolean>;
  destroy(filter: Partial<T>): Promise<boolean>;
}

interface IValidator {
  validate(data: unknown, type: ValidationType): Promise<{
    hasError: boolean;
    errors?: Record<string, unknown>
  }>;
}

class Controller<T> {
  protected Validator: IValidator | null;
  protected Service: IService<T>;

  constructor(Service: IService<T>, Validator: IValidator | null = null) {
    this.Service = Service;
    this.Validator = Validator;
  }

  protected success(message: string, data: unknown) {
    return {
      success: true,
      message,
      data: typeof data === "object" ? data : { status: Boolean(data) }
    };
  }

  protected failure(message: string, errors: Record<string, unknown> = {}) {
    return {
      success: false,
      message,
      errors
    };
  }

  protected paginate(page: number, size: number, data: T[]) {
    const start = (page - 1) * size;
    const paginatedData = data.slice(start, start + size);
    return {
      total: data.length,
      start: start + 1,
      end: Math.min(start + size, data.length),
      totalPages: Math.ceil(data.length / size),
      currentPage: page,
      data: paginatedData
    };
  }

  public async add(req: Request, res: Response): Promise<Response> {
    try {
      if (this.Validator) {
        const validation = await this.Validator.validate(req.body, ValidationType.ADD);
        if (validation.hasError) {
          logger.warn("Validation failed during add operation", { errors: validation.errors });
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json(this.failure(ErrorMessage.HTTP_BAD_REQUEST, validation.errors));
        }
      }
      const addedData = await this.Service.addAndReturn(req.body as Partial<T>);
      logger.info("Data added successfully", { data: addedData });
      return res
        .status(StatusCodes.OK)
        .json(this.success(ErrorMessage.HTTP_OK, addedData));
    } catch (error: unknown) {
      logger.error("Error adding data", { error });
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(this.failure(
          ErrorMessage.HTTP_INTERNAL_SERVER_ERROR,
          { error: String(error)
          }));
    }
  }

  public async all(req: Request, res: Response): Promise<Response> {
    try {
      const data = await this.Service.all();
      const page = parseInt(req.query.page as string, 10) || 0;
      const size = parseInt(req.query.size as string, 10) || 0;
      const responseData = page && size ? this.paginate(page, size, data) : data;
      logger.info("Fetched all data successfully", {
        page,
        size,
        total: data.length
      });
      return res
        .status(StatusCodes.OK)
        .json(this.success(ErrorMessage.HTTP_OK, responseData));
    } catch (error: unknown) {
      logger.error("Error fetching all data", { error });
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(this.failure(
          ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, { error: String(error)
          }));
    }
  }

  public async edit(req: Request, res: Response): Promise<Response> {
    try {
      if (this.Validator) {
        const validation = await this.Validator.validate(req.body, ValidationType.EDIT);
        if (validation.hasError) {
          logger.warn("Validation failed during edit operation", { errors: validation.errors });
          return res
            .status(StatusCodes.BAD_REQUEST)
            .json(this.failure(ErrorMessage.HTTP_BAD_REQUEST, validation.errors));
        }
      }
      const { field, value } = req.params;
      const filter = { [field]: value } as Partial<T>;
      const dataExists = await this.Service.singleByField(filter);

      if (!dataExists) {
        logger.info("Edit operation failed, entry not found", { field, value });
        return res
          .status(StatusCodes.NOT_FOUND)
          .json(this.failure("Entry does not exist in the record."));
      }

      await this.Service.update(filter, req.body as Partial<T>);
      const updatedData = await this.Service.singleByField(filter);
      logger.info("Data updated successfully", { updatedData });
      return res
        .status(StatusCodes.OK)
        .json(this.success("Updated successfully", updatedData));
    } catch (error: unknown) {
      logger.error("Error updating data", { error });
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(this.failure(ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, { error: String(error) }));
    }
  }

  public async single(req: Request, res: Response): Promise<Response> {
    try {
      const { field, value } = req.params;
      const filter = { [field]: value } as Partial<T>;
      const data = await this.Service.singleByField(filter);

      if (!data) {
        logger.info("Single data fetch failed, entry not found", { field, value });
        return res
          .status(StatusCodes.NOT_FOUND)
          .json(this.failure("Entry does not exist in the record."));
      }
      logger.info("Fetched single data successfully", { data });
      return res
        .status(StatusCodes.OK)
        .json(this.success(ErrorMessage.HTTP_OK, data));
    } catch (error: unknown) {
      logger.error("Error fetching single record", { error });
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(this.failure(ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, { error: String(error) }));
    }
  }

  public async destroy(req: Request, res: Response): Promise<Response> {
    try {
      const { field, value } = req.params;
      const filter = { [field]: value } as Partial<T>;
      const dataExists = await this.Service.singleByField(filter);

      if (!dataExists) {
        logger.info("Destroy operation failed, entry not found", { field, value });
        return res
          .status(StatusCodes.NOT_FOUND)
          .json(this.failure("Entry does not exist in the record."));
      }

      await this.Service.destroy(filter);
      logger.info("Data deleted successfully", { field, value });
      return res
        .status(StatusCodes.OK)
        .json(this.success("Deleted successfully", {}));
    } catch (error : unknown) {
      logger.error("Error deleting data", { error });
      return res
        .status(StatusCodes.INTERNAL_SERVER_ERROR)
        .json(this.failure(ErrorMessage.HTTP_INTERNAL_SERVER_ERROR, {
          error: String(error)
        }));
    }
  }
}

export default Controller;
