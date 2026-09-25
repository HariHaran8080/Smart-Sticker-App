export interface IUser {
  _id: string;
  name: string;
  email: string;
  passwordHash: string;
  avatar?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStickerSettings {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotation?: number; // 0, 90, 180, 270
  scale?: number; // 0.1 to 3.0
  position?: {
    x: number;
    y: number;
  };
  outline?: {
    enabled: boolean;
    style: 'white' | 'black' | 'custom' | 'soft' | 'none';
    color: string;
    width: number; // in pixels
  };
  text?: {
    content: string;
    fontSize: number;
    color: string;
    bold: boolean;
    align: 'top' | 'center' | 'bottom' | 'custom';
    x?: number;
    y?: number;
    customY?: number;
  };
  emoji?: {
    symbol: string;
    position: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'center';
    size: number;
  };
  shadow?: {
    enabled: boolean;
    color: string;
    blur: number;
    offsetX: number;
    offsetY: number;
    opacity: number;
  };
  reflection?: {
    enabled: boolean;
    opacity: number;
    distance: number;
  };
  adjust?: {
    brightness: number; // -100 to 100
    contrast: number;   // -100 to 100
    saturation: number; // -100 to 100
    hue: number;        // 0 to 360
    blur: number;       // 0 to 20
  };
  blend?: string; // 'normal' | 'multiply' | 'screen' | 'overlay' etc.
  flip?: {
    horizontal: boolean;
    vertical: boolean;
  };
  canvasBackground?: {
    type: 'transparent' | 'solid' | 'gradient';
    color: string;
    gradient?: string;
  };
  exportFormat?: 'png' | 'webp';
  targetSize?: number; // 512 for WhatsApp, 128 for Discord, 0 for original
}

export interface ISticker {
  _id: string;
  userId?: any;
  name: string;
  originalImage: string;
  processedImage?: string;
  stickerImage: string;
  format: 'png' | 'webp';
  width: number;
  height: number;
  fileSize: number;
  settings: IStickerSettings;
  createdAt: Date;
  updatedAt: Date;
}

export interface IStickerPack {
  _id: string;
  userId: any;
  name: string;
  description?: string;
  stickers: any[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}
