import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  firstName: string;
  lastName: string;
  email: string;
  photo: string;
  username: string;
}

const UserSchema: Schema = new Schema({
  clerkId: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  photo: { type: String, required: true },
  username: { type: String, required: true, unique: true },
});

export default mongoose.models.User || mongoose.model<IUser>('User', UserSchema);