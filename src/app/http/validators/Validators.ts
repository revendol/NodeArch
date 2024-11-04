import Validator, { Rules } from 'validatorjs';
import mongoose from 'mongoose';
import ErrorMessage from "@shared/errorMessage";
import logger from "@util/logger";

// Define a type for validation rules compatible with validatorjs
type ValidationRules = Record<string, string | string[]>;

// Custom validator to check if a value is unique in the database
Validator.registerAsync('unique', async (value, args, attribute, passes) => {
  try {
    const [modelName, fieldName] = args.split(','); // e.g., "User,email"
    const Model = mongoose.model(modelName); // Get the Mongoose model
    const condition = { [fieldName]: value }; // Query condition

    const exists = await Model.exists(condition); // Check for existence
    exists ? passes(false, `${fieldName} already exists`) : passes(); // Pass/fail based on result
  } catch (error) {
    logger.error('Error in unique validator:', error);
    passes(false, 'Validation error occurred');
  }
}, 'The :attribute must be unique.');

export enum ValidationType {
  ADD = 'ADD', EDIT = 'EDIT', DELETE = 'DELETE', CUSTOM = 'CUSTOM'
}
export interface IValidation {
  hasError: boolean;
  message: string;
  errors?: Record<string, unknown>;
}

class Validators {
  private readonly rules: { [key in ValidationType]: ValidationRules };

  constructor(
    addRules: ValidationRules = {},
    editRules: ValidationRules = {},
    deleteRules: ValidationRules = {},
  ) {
    this.rules = {
      [ValidationType.ADD]: addRules,
      [ValidationType.EDIT]: editRules,
      [ValidationType.DELETE]: deleteRules,
      [ValidationType.CUSTOM]: {}, // Initialize CUSTOM rules as an empty object
    };
  }

  // Main validation function
  public async validate(
    data: Record<string, unknown>,
    type: ValidationType,
    customRules: ValidationRules = {}
  ): Promise<IValidation> {
    try {
      const rules = type === ValidationType.CUSTOM
        ? customRules
        : { ...this.rules[type], ...customRules };

      // If no rules are present, automatically pass validation
      if (Object.keys(rules).length === 0) {
        return {
          hasError: false,
          message: ErrorMessage.HTTP_CONTINUE,
        };
      }

      const validation = new Validator(data, rules as Rules);

      // Check for validation asynchronously
      return new Promise((resolve) => {
        validation.checkAsync(
          () => resolve({
            hasError: false,
            message: ErrorMessage.HTTP_CONTINUE,
          }),
          () => resolve({
            hasError: true,
            message: ErrorMessage.HTTP_BAD_REQUEST,
            errors: validation.errors.errors as Record<string, unknown>,
          })
        );
      });
    } catch (error) {
      logger.error("Validation error:", error);
      return {
        hasError: true,
        message: ErrorMessage.HTTP_INTERNAL_SERVER_ERROR,
        errors: { general: String(error) },
      };
    }
  }

  public async validateAdd(data: Record<string, unknown>) {
    return this.validate(data, ValidationType.ADD);
  }

  public async validateEdit(data: Record<string, unknown>) {
    return this.validate(data, ValidationType.EDIT);
  }
}

export default Validators;
