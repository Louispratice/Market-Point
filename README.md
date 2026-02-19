# MarketPoint API

A marketplace REST API for product listings with user authentication, built with Node.js, Express 5, and MongoDB.

## Features

- User signup, login, email verification
- JWT-based authentication
- Product CRUD with image uploads (Multer, 5MB limit)
- Seller-scoped product management

## Prerequisites

- Node.js 18.x
- npm

## Getting Started

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Create a `.env` file in the project root:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/marketpoint
JWT_SECRET=your_secret_here
```

### 3. Run the server

**Development** (auto-reload with nodemon):

```bash
npm run dev
```

**Production**:

```bash
npm start
```

### Local development without MongoDB

If you don't have MongoDB installed, the server automatically uses an in-memory database via `mongodb-memory-server` (installed as a dev dependency). Data will not persist between restarts.

To use a real database, set `MONGODB_URI` in `.env` to a MongoDB connection string (local or Atlas).

## API Endpoints

### Auth (`/api/auth`)

| Method | Path                   | Auth | Description               |
| ------ | ---------------------- | ---- | ------------------------- |
| POST   | `/signup`              | No   | Create account            |
| POST   | `/login`               | No   | Login, returns JWT        |
| POST   | `/verify-email`        | No   | Verify email with token   |
| POST   | `/resend-verification` | Yes  | Resend verification token |
| PUT    | `/update`              | Yes  | Update username/email     |
| POST   | `/change-password`     | Yes  | Change password           |
| GET    | `/profile`             | Yes  | Get current user profile  |
| DELETE | `/delete`              | Yes  | Delete account            |

### Products (`/api/products`)

| Method | Path   | Auth | Description                        |
| ------ | ------ | ---- | ---------------------------------- |
| GET    | `/`    | No   | List all products                  |
| GET    | `/:id` | No   | Get single product                 |
| POST   | `/`    | Yes  | Create product (multipart, images) |
| PUT    | `/:id` | Yes  | Update product (owner only)        |
| DELETE | `/:id` | Yes  | Delete product (owner only)        |

Protected routes require a `Bearer <token>` header.

## Project Structure

```
server.js          — Entry point: MongoDB connection + server startup
app.js             — Express app setup, middleware, route mounting
controllers/       — Route handler logic
models/            — Mongoose schemas and models
middlewares/       — Auth, error handling, file upload middleware
route/             — Express routers
uploads/           — Uploaded images (served at /uploads)
```

## Deploy to Railway

1. Push your code to GitHub
2. Create a new project on [railway.app](https://railway.app) and connect your repo
3. Add a MongoDB plugin: **New > Database > MongoDB**
4. Link the MongoDB plugin to your service — Railway provides the connection string automatically
5. Set environment variables in your service settings:
   - `MONGODB_URI` — copy from the MongoDB plugin (or use the `MONGO_URL` variable reference)
   - `JWT_SECRET` — any strong random string
   - `PORT` is set automatically by Railway

Railway detects `npm start` from `package.json` and deploys automatically.

## License

ISC
