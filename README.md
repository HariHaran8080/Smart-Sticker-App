# Smart Sticker App (StickerForge) 🎨✨

A modern, full-stack smart sticker maker and generator web application. Easily create, edit, customize with die-cut contours, and organize stickers into downloadable packs or WhatsApp-ready sticker formats.

---

## 🌟 Key Features

- **Smart Background Removal**: Built-in dual engine with local smart color segmentation fallback and optional external AI provider (`remove.bg`).
- **Die-Cut Contouring**: Dynamic stroke dilation and drop shadows for realistic physical sticker appearance.
- **Interactive Canvas Editor**:
  - Live preview with zoom, pan, grid overlay, and layer manipulation.
  - Custom text layers with font, size, rotation, and meme formatting.
  - Image adjustments: Brightness, contrast, saturation, sharpness, and tint.
  - Pre-built sticker templates.
- **Export Options**: Single-click downloads for transparent PNG, WEBP, and official WhatsApp 512×512 sticker standard.
- **Pack Management**: Organize stickers into packs and bulk export as `.zip` archives.
- **Security & Protection**: SSRF defense against internal IP/metadata scraping, rate limiting, and Helmet headers.
- **Authentication**: JWT-based user authentication and personal sticker libraries with MongoDB.

---

## 🛠️ Tech Stack

- **Frontend**: React 18, TypeScript, Vite, Tailwind CSS, Lucide Icons, React Router v7.
- **Backend**: Node.js, Express, TypeScript, Sharp (high-performance image processing), Mongoose (MongoDB), Multer, Archiver.
- **Testing**: Vitest with unit & integration test coverage.

---

## 🚀 Local Development Setup

### Prerequisites
- Node.js (v18 or later)
- MongoDB running locally (`mongodb://127.0.0.1:27017/stickerforge`) or a MongoDB Atlas URI

### 1. Installation
```bash
git clone https://github.com/HariHaran8080/Smart-Sticker-App.git
cd Smart-Sticker-App
npm install
```

### 2. Configure Environment
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Run Development Servers
```bash
npm run dev
```
- Client runs at: `http://localhost:5173`
- Backend API runs at: `http://localhost:5000`

### 4. Run Test Suite
```bash
npm test
```

---

## 🌐 Production Deployment Guide

### Part 1: Deploy Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New + > Web Service**.
2. Connect your GitHub repository: `https://github.com/HariHaran8080/Smart-Sticker-App`.
3. Configure the service:
   - **Name**: `smart-sticker-api` (or your preferred name)
   - **Root Directory**: `server`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables** in Render:
   - `NODE_ENV`: `production`
   - `PORT`: `5000` (or let Render set it automatically)
   - `MONGODB_URI`: *Your MongoDB Atlas connection URI* (e.g., `mongodb+srv://<user>:<password>@cluster0.mongodb.net/stickerforge?retryWrites=true&w=majority`)
   - `JWT_SECRET`: *A strong random secret string*
   - `CLIENT_URL`: *Your Vercel app URL* (e.g., `https://smart-sticker-app.vercel.app`)
   - `STORAGE_TYPE`: `local`
   - `BACKGROUND_REMOVAL_PROVIDER`: `local` (or `removebg` if you supply `REMOVE_BG_API_KEY`)
5. Click **Create Web Service**. Once deployed, copy your Render service URL (e.g., `https://smart-sticker-api.onrender.com`).

---

### Part 2: Deploy Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/) and click **Add New... > Project**.
2. Import the `HariHaran8080/Smart-Sticker-App` repository.
3. In project settings:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click *Edit* and select `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. In **Environment Variables**, add:
   - `VITE_API_URL`: *Your Render backend URL from Part 1* (e.g., `https://smart-sticker-api.onrender.com`)
5. Click **Deploy**.

---

## 📜 License
ISC
