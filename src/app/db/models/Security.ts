import { Schema, model, Document } from "mongoose";

export interface ISecurity extends Document {
  _id?: string;
  userCustomID?: string;
  accessToken: string;
  refreshToken: string;
  refreshTokenExpiresAt: Date;
}

// Define schema
const securitySchema = new Schema<ISecurity>(
  {
    userCustomID: {
      type: String,
      ref: "User",
      trim: true,
      index: true,
    },
    accessToken: { type: String, trim: true, required: true },
    refreshToken: { type: String, trim: true, required: true },
    refreshTokenExpiresAt: {
      type: Date,
      required: true,
    },
  },
  { timestamps: true }
);

export default model<ISecurity>("Security", securitySchema);
