import { Schema, model, Document } from "mongoose";

export interface IProfile extends Document {
  _id?: string;
  customID?: string;
  name: string;
  email: string;
}
// Schema definition
const profileSchema = new Schema<IProfile>(
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
  },
  { timestamps: true }
);

profileSchema.pre("save", function (next) {
  const user = this as IProfile;
  const random = Math.floor(Math.random() * 10000) + 1;
  user.customID = `CA-${Date.now()}-${random}`;
  next();
});

export default model<IProfile>("Profile", profileSchema);
