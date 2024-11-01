import {Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  _id?: string;
  customID?: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
  status?: string;
  accountStatus?: string;
  password: string;
  isVerified?: boolean;
}
// Schema definition
const userSchema = new Schema<IUser>(
  {
    customID: { type: String, trim: true },
    name: { type: String, trim: true, required: true },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      trim: true,
      lowercase: true,
      validate: {
        validator: (email: string) => {
          return /^[\w.-]+@[a-zA-Z\d.-]+\.[a-zA-Z]{2,3}$/.test(email);
        },
        message: (props) => `${String(props.value)} is not a valid email address`,
      },
    },
    phone: { type: String, trim: true },
    role: {
      type: String,
      trim: true,
      default: "User",
      enum: ["Super admin", "Admin", "Manager", "Content Officer", "User"],
    },
    status: {
      type: String,
      trim: true,
      default: "Offline",
      enum: ["Offline", "Online"],
    },
    accountStatus: {
      type: String,
      trim: true,
      default: "Active",
      enum: ["Active", "Deactivate"],
    },
    password: { type: String, trim: true, required: true },
    isVerified: { type: Boolean, default: false },
  },
  { timestamps: true }
);

userSchema.pre("save",function (next) {
  const user = this as IUser;
  const random = Math.floor(Math.random() * 10000) + 1;
  user.customID = `CA-${Date.now()}-${random}`;
  next();
});

export default model<IUser>("User", userSchema);
