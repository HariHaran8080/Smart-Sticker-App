import mongoose, { Schema, Document } from 'mongoose';
import { ISticker } from '../types';

export interface IStickerDocument extends Document {
  userId?: mongoose.Types.ObjectId | null;
  name: string;
  originalImage: string;
  processedImage?: string | null;
  stickerImage: string;
  format: 'png' | 'webp';
  width: number;
  height: number;
  fileSize: number;
  settings: any;
  createdAt: Date;
  updatedAt: Date;
}

const StickerSchema = new Schema<IStickerDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
      default: 'My Sticker',
    },
    originalImage: {
      type: String,
      required: true,
    },
    processedImage: {
      type: String,
      default: null,
    },
    stickerImage: {
      type: String,
      required: true,
    },
    format: {
      type: String,
      enum: ['png', 'webp'],
      default: 'webp',
    },
    width: {
      type: Number,
      required: true,
    },
    height: {
      type: Number,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    settings: {
      crop: {
        x: Number,
        y: Number,
        width: Number,
        height: Number,
      },
      rotation: {
        type: Number,
        default: 0,
      },
      scale: {
        type: Number,
        default: 1.0,
      },
      position: {
        x: { type: Number, default: 0 },
        y: { type: Number, default: 0 },
      },
      outline: {
        enabled: { type: Boolean, default: true },
        style: { type: String, default: 'white' },
        color: { type: String, default: '#ffffff' },
        width: { type: Number, default: 8 },
      },
      text: {
        content: { type: String, default: '' },
        fontSize: { type: Number, default: 32 },
        color: { type: String, default: '#ffffff' },
        bold: { type: Boolean, default: true },
        align: { type: String, default: 'bottom' },
        customY: Number,
      },
      emoji: {
        symbol: { type: String, default: '' },
        position: { type: String, default: 'top-right' },
        size: { type: Number, default: 48 },
      },
      exportFormat: {
        type: String,
        default: 'webp',
      },
      targetSize: {
        type: Number,
        default: 512,
      },
    },
  },
  {
    timestamps: true,
  }
);

export const Sticker = mongoose.model<IStickerDocument>('Sticker', StickerSchema);
