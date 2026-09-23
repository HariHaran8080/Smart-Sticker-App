import mongoose, { Schema, Document } from 'mongoose';
import { IStickerPack } from '../types';

export interface IStickerPackDocument extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  description?: string;
  stickers: any[];
  createdAt: Date;
  updatedAt: Date;
}

const StickerPackSchema = new Schema<IStickerPackDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      default: '',
      maxlength: 300,
    },
    stickers: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Sticker',
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const StickerPack = mongoose.model<IStickerPackDocument>('StickerPack', StickerPackSchema);
