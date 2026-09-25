export interface User {
  id: string;
  name: string;
  email: string;
  createdAt?: string;
}

export interface StickerSettings {
  crop?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  rotation: number; // 0, 90, 180, 270
  scale: number;
  position: {
    x: number;
    y: number;
  };
  outline: {
    enabled: boolean;
    style: 'white' | 'black' | 'custom' | 'soft' | 'none';
    color: string;
    width: number;
  };
  text: {
    content: string;
    fontSize: number;
    color: string;
    bold: boolean;
    align: 'top' | 'center' | 'bottom' | 'custom';
    x?: number;
    y?: number;
    fontFamily?: string;
    strokeColor?: string;
    strokeWidth?: number;
    backgroundColor?: string;
    stylePreset?: string;
    customY?: number;
  };
  emoji: {
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
  blend?: string;
  flip?: {
    horizontal: boolean;
    vertical: boolean;
  };
  canvasBackground?: {
    type: 'transparent' | 'solid' | 'gradient';
    color: string;
    gradient?: string;
  };
  exportFormat: 'png' | 'webp';
  targetSize: number; // 512, 128, 0 (original)
}

export interface Sticker {
  _id: string;
  userId?: string;
  name: string;
  originalImage: string;
  processedImage?: string | null;
  stickerImage: string;
  format: 'png' | 'webp';
  width: number;
  height: number;
  fileSize: number;
  settings: StickerSettings;
  createdAt: string;
  updatedAt: string;
}

export interface StickerPack {
  _id: string;
  userId: string;
  name: string;
  description?: string;
  stickers: Sticker[];
  createdAt: string;
  updatedAt: string;
}
