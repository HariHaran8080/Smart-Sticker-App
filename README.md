# StickerForge

StickerForge is a full-stack web application for creating, customizing, and organizing digital stickers from images. Users can upload an image or provide an image URL, remove backgrounds, customize the sticker using an interactive editor, and export the result in multiple formats.

The application also supports sticker pack management, bulk ZIP exports, authentication, and WhatsApp-compatible 512×512 sticker output.

## Features

### Image Processing

- Image upload and image URL support
- Automatic background removal
- Local smart color-segmentation fallback
- Optional integration with remove.bg
- Transparent image generation
- Image resizing and optimization

### Sticker Editor

- Interactive canvas-based editor
- Zoom and pan controls
- Grid overlay
- Layer manipulation
- Crop and resize
- Image rotation
- Brightness adjustment
- Contrast adjustment
- Saturation adjustment
- Sharpness adjustment
- Tint adjustment
- Custom text layers
- Font and text-size customization
- Text rotation
- Meme-style text formatting
- Emoji support
- Pre-built sticker templates

### Sticker Styling

- Dynamic die-cut contours
- Custom outline thickness
- Transparent backgrounds
- Drop shadows
- Sticker preview

### Export

- Transparent PNG export
- WebP export
- WhatsApp-compatible 512×512 sticker export
- Individual sticker downloads
- Sticker pack ZIP export

### Sticker Management

- User authentication
- Personal sticker library
- Create and manage sticker packs
- Add stickers to packs
- Bulk sticker export

### Security

- JWT-based authentication
- Password protection
- Request validation
- Rate limiting
- Helmet security headers
- SSRF protection for remote image URLs
- Protection against internal IP and metadata endpoint access
- Environment-based configuration

## Technology Stack

### Frontend

- React 18
- TypeScript
- Vite
- Tailwind CSS
- React Router v7
- Lucide React

### Backend

- Node.js
- Express.js
- TypeScript
- Sharp
- Mongoose
- Multer
- Archiver

### Database

- MongoDB
- MongoDB Atlas support

### Testing

- Vitest
- Unit tests
- Integration tests

## Application Architecture

```text
User
 │
 ▼
React + TypeScript Frontend
 │
 │ REST API
 ▼
Node.js + Express Backend
 │
 ├── Authentication
 ├── Image Processing
 ├── Background Removal
 ├── Sticker Generation
 ├── Sticker Management
 └── Sticker Pack Generation
 │
 ├───────────────┐
 ▼               ▼
MongoDB       File Storage
```

## Sticker Generation Workflow

```text
Upload Image / Image URL
          │
          ▼
    Image Validation
          │
          ▼
  Background Removal
          │
          ▼
     Image Editing
          │
          ├── Crop
          ├── Resize
          ├── Rotate
          ├── Adjustments
          ├── Text
          ├── Emoji
          └── Border
          │
          ▼
    Sticker Processing
          │
          ▼
   PNG / WebP Export
          │
          ▼
512×512 Sticker Export
```

## Project Structure

```text
Smart-Sticker-App/
│
├── client/
│   ├── src/
│   └── package.json
│
├── server/
│   ├── src/
│   └── package.json
│
├── .env.example
├── .gitignore
├── package.json
├── README.md
└── ...
```

## Prerequisites

Before running the project locally, make sure you have:

* Node.js 18 or later
* npm
* MongoDB running locally or a MongoDB Atlas database

For local MongoDB, the default connection can be:

```text
mongodb://127.0.0.1:27017/stickerforge
```

## Installation

Clone the repository:

```bash
git clone https://github.com/HariHaran8080/Smart-Sticker-App.git
```

Navigate to the project directory:

```bash
cd Smart-Sticker-App
```

Install dependencies:

```bash
npm install
```

If the frontend and backend have separate dependencies, install them as required:

```bash
cd client
npm install

cd ../server
npm install
```

## Environment Configuration

Create a `.env` file based on `.env.example`.

Example:

```env
NODE_ENV=development

PORT=5000

MONGODB_URI=mongodb://127.0.0.1:27017/stickerforge

JWT_SECRET=your_secure_jwt_secret

CLIENT_URL=http://localhost:5173

STORAGE_TYPE=local

BACKGROUND_REMOVAL_PROVIDER=local

REMOVE_BG_API_KEY=your_remove_bg_api_key
```

The `REMOVE_BG_API_KEY` is only required when using the remove.bg provider.

Never commit `.env` files or API keys to the repository.

## Running the Application

Start the development environment:

```bash
npm run dev
```

The application runs on:

```text
Frontend:
http://localhost:5173

Backend:
http://localhost:5000
```

If the frontend and backend are started separately:

```bash
# Frontend
cd client
npm run dev
```

```bash
# Backend
cd server
npm run dev
```

## Testing

Run the test suite with:

```bash
npm test
```

The project uses Vitest for unit and integration testing.

## Production Build

Build the frontend:

```bash
cd client
npm run build
```

Build the backend:

```bash
cd server
npm run build
```

## Deployment

### Backend — Render

The backend can be deployed using Render.

1. Open the Render Dashboard.
2. Create a new Web Service.
3. Connect the GitHub repository.
4. Configure the service using the following settings:

```text
Root Directory: server
Environment: Node
Build Command: npm install && npm run build
Start Command: npm start
```

Configure the following environment variables:

```text
NODE_ENV=production
PORT=5000
MONGODB_URI=<MongoDB Atlas connection URI>
JWT_SECRET=<secure random secret>
CLIENT_URL=<deployed frontend URL>
STORAGE_TYPE=local
BACKGROUND_REMOVAL_PROVIDER=local
```

If using remove.bg:

```text
REMOVE_BG_API_KEY=<your API key>
```

After deployment, copy the Render backend URL.

## Frontend — Vercel

The frontend can be deployed using Vercel.

1. Open the Vercel Dashboard.
2. Import the GitHub repository.
3. Set the root directory to:

```text
client
```

4. Configure:

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
```

5. Add the frontend environment variable:

```text
VITE_API_URL=<deployed backend URL>
```

6. Deploy the application.

## Security Considerations

StickerForge includes several security measures for handling user uploads and remote image URLs.

* JWT-based authentication
* Password hashing
* Request validation
* Rate limiting
* Helmet security headers
* File type and size validation
* SSRF protection for remote URLs
* Protection against localhost and private network access
* Environment variables for sensitive configuration
* API keys kept on the server
* Safe handling of uploaded files

Sensitive credentials should never be stored directly in source code or committed to GitHub.

## Future Improvements

Potential improvements include:

* Animated sticker support
* Additional sticker templates
* More advanced image editing tools
* Cloud object storage
* Improved background-removal models
* Advanced sticker pack management
* Native mobile sticker integration
* Additional messaging platform export options

## License

This project is licensed under the ISC License.
