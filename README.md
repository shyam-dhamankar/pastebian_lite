# 📋 Pastebin-Lite

> A modern, lightweight pastebin application built with Next.js 16, React 19, TypeScript, and MongoDB. Share text snippets with optional expiration times and view limits.

![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?style=flat-square&logo=next.js)
![React](https://img.shields.io/badge/React-19.2.3-61DAFB?style=flat-square&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5.x-3178C6?style=flat-square&logo=typescript)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?style=flat-square&logo=mongodb)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC?style=flat-square&logo=tailwind-css)

## ✨ Features

- 🚀 **Modern Tech Stack** - Built with Next.js 16 App Router and React 19
- 💾 **MongoDB Persistence** - Reliable data storage with MongoDB Atlas
- ⏱️ **TTL Support** - Set pastes to automatically expire after a specified time
- 👁️ **View Limits** - Restrict the number of times a paste can be viewed
- 🎨 **Dark Mode** - Beautiful UI with automatic dark mode support
- 📱 **Responsive Design** - Works seamlessly on desktop and mobile devices
- ⚡ **Fast & Lightweight** - Optimized for performance
- 🔒 **Type-Safe** - Full TypeScript support throughout the codebase

## 📸 Screenshots

### Create Paste
![Create Paste Interface](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Pastebin-Lite+Create+Interface)

### View Paste
![View Paste Interface](https://via.placeholder.com/800x400/1a1a1a/ffffff?text=Pastebin-Lite+View+Interface)

## 🛠️ Tech Stack

- **Framework:** [Next.js 16.1.1](https://nextjs.org/) (App Router)
- **UI Library:** [React 19.2.3](https://react.dev/)
- **Language:** [TypeScript 5.x](https://www.typescriptlang.org/)
- **Database:** [MongoDB 7.0](https://www.mongodb.com/)
- **Styling:** [TailwindCSS 4.x](https://tailwindcss.com/)
- **Linting:** [ESLint 9](https://eslint.org/)

## 🚀 Getting Started

### Prerequisites

- Node.js 18.x or higher
- npm, yarn, pnpm, or bun
- MongoDB Atlas account (or local MongoDB instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Patebain_Lite
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   # or
   pnpm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   MONGODB_URI=mongodb+srv://<username>:<password>@<cluster-url>/<database-name>
   ```

4. **Run the development server**
   ```bash
   npm run dev
   # or
   yarn dev
   # or
   pnpm dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
Patebain_Lite/
├── app/
│   ├── api/
│   │   ├── healthz/           # Health check endpoint
│   │   │   └── route.ts
│   │   └── pastes/            # Paste API endpoints
│   │       ├── [id]/
│   │       │   └── route.ts   # GET paste by ID
│   │       └── route.ts       # POST create paste
│   ├── p/[id]/                # View paste page
│   │   └── page.tsx
│   ├── globals.css            # Global styles
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Home page
├── lib/
│   ├── mongodb.ts             # MongoDB connection utility
│   ├── storage.ts             # Storage interface & implementation
│   └── time.ts                # Time utilities
├── .env.local                 # Environment variables (not in git)
├── .gitignore
├── package.json
├── tsconfig.json
└── README.md
```

## 🔌 API Reference

### Create Paste

**Endpoint:** `POST /api/pastes`

**Request Body:**
```json
{
  "content": "Your paste content here",
  "ttl_seconds": 3600,          // Optional: Time to live in seconds
  "max_views": 10               // Optional: Maximum number of views
}
```

**Response:**
```json
{
  "id": "abc123xy",
  "url": "http://localhost:3000/p/abc123xy"
}
```

**Status Codes:**
- `200` - Paste created successfully
- `400` - Invalid request (missing content, invalid TTL, or invalid max_views)

### Get Paste

**Endpoint:** `GET /api/pastes/:id`

**Response:**
```json
{
  "content": "Your paste content",
  "remaining_views": 9,         // null if no limit
  "expires_at": "2026-01-05T12:00:00.000Z"  // null if no expiration
}
```

**Status Codes:**
- `200` - Paste found
- `404` - Paste not found or expired

### Health Check

**Endpoint:** `GET /api/healthz`

**Response:**
```json
{
  "status": "ok"
}
```

## 💡 Usage Examples

### Create a Permanent Paste

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Hello, World!"}'
```

### Create a Paste with TTL (1 hour)

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"This expires in 1 hour","ttl_seconds":3600}'
```

### Create a Paste with View Limit

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"View me only 5 times","max_views":5}'
```

### Create a Paste with Both TTL and View Limit

```bash
curl -X POST http://localhost:3000/api/pastes \
  -H "Content-Type: application/json" \
  -d '{"content":"Expires in 30 min OR after 10 views","ttl_seconds":1800,"max_views":10}'
```

## 🏗️ Architecture

### Storage Layer

The application uses a storage abstraction pattern with MongoDB implementation:

```typescript
interface Storage {
  createPaste(paste: Omit<Paste, 'id' | 'createdAt' | 'currentViews'>): Promise<Paste>;
  getPaste(id: string, currentTimeMs?: number): Promise<Paste | null>;
  updatePaste(id: string, paste: Partial<Paste>): Promise<Paste | null>;
  deletePaste(id: string): Promise<boolean>;
}
```

### Data Model

```typescript
interface Paste {
  id: string;              // Unique identifier
  content: string;         // Paste content
  createdAt: number;       // Unix timestamp
  ttlSeconds?: number;     // Time to live in seconds
  maxViews?: number;       // Maximum view count
  currentViews: number;    // Current view count
}
```

## 🧪 Testing

Run the linter:
```bash
npm run lint
```

## 🚢 Deployment

### Deploy to Vercel

1. Push your code to GitHub
2. Import your repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard:
   - `MONGODB_URI`
4. Deploy!

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone)

### Build for Production

```bash
npm run build
npm run start
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👨‍💻 Author

**Shyam**

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- Styled with [TailwindCSS](https://tailwindcss.com/)
- Database powered by [MongoDB](https://www.mongodb.com/)

---

<p align="center">Made with ❤️ using Next.js & MongoDB</p>
#use of pastebian lite video

  <video src="https://github.com/shyam-dhamankar/pastebian_lite/blob/main/pastebian_lite(1).mp4" type="video/mp4" controls>
</video>
