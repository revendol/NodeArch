import { Schema, model, Document } from "mongoose";

export interface IValidation extends Document {
  _id?: string;
  userCustomID: string;
  code: string;
  expiresAt: Date;
}

// Schema definition
const verificationSchema = new Schema<IValidation>(
  {
    userCustomID: { type: String, ref: "User", required: true, index: true },
    code: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: (value: string) => /^\d{6}$/.test(value),
        message: "Code must be a 6-digit number",
      },
    },
    expiresAt: { type: Date, required: true, index: true },
  },
  { timestamps: true }
);

export default model<IValidation>("Verification", verificationSchema);
