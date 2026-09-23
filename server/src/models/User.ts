import mongoose, { Schema, Document } from 'mongoose';
import { IUser } from '../types';

export interface IUserDocument extends Omit<IUser, '_id'>, Document {}

const UserSchema = new Schema<IUserDocument>(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 50,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\S+@\S+\.\S+$/, 'Please use a valid email address'],
    },
    passwordHash: {
      type: String,
      required: true,
    },
    avatar: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Do not return passwordHash in json serialization
UserSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

export const User = mongoose.model<IUserDocument>('User', UserSchema);
