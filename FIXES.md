# MarketPoint — Bug Fixes & Improvements

## Critical Bugs Fixed

### 1. User model field mismatch (`models/user.js`)

- **Problem:** Schema had `name` field but auth controller used `username`. Signup would fail because `name` was required and `username` wasn't in the schema.
- **Fix:** Renamed `name` to `username` in the schema.

### 2. Missing email verification fields (`models/user.js`)

- **Problem:** `isEmailVerified`, `emailVerificationToken`, and `emailVerificationExpires` were not defined in the schema. Mongoose silently stripped them on save, so email verification never worked.
- **Fix:** Added all three fields to the User schema.

### 3. Double password hashing (`models/user.js`)

- **Problem:** The auth controller hashed the password with bcrypt before saving, and the User model had a `pre("save")` hook that hashed it again. Login would always fail because `bcrypt.compare` ran against a double-hashed value.
- **Fix:** Removed the `pre("save")` hook and `select: false` on password. The controller handles hashing directly.

### 4. Product schema field name mismatch (`models/product.js`)

- **Problem:** Schema defined `image` (singular) but the controller saved to `images` (plural). Mongoose stripped the unknown field, so images were never persisted.
- **Fix:** Renamed the schema field from `image` to `images`.

### 5. Product model never exported (`models/product.js`)

- **Problem:** The file defined the schema but never called `mongoose.model()` or exported it. `import Product` in the controller would get `undefined`.
- **Fix:** Added `export default mongoose.model("Product", productSchema)`.

### 6. `product.remove()` deprecated (`controllers/productController.js`)

- **Problem:** `document.remove()` was removed in Mongoose 9. `deleteProduct` would throw a runtime error.
- **Fix:** Replaced with `Product.findByIdAndDelete(req.params.id)`.

### 7. Upload middleware not exported (`middlewares/uploadMiddleware.js`)

- **Problem:** The `upload` multer instance was created but never exported. The import in `productRoutes.js` would get `undefined`.
- **Fix:** Added `export default upload`.

## Security Improvements

### 8. Verification token no longer exposed in signup response (`controllers/auth.controllers.js`)

- **Problem:** The raw `verificationToken` was returned in the JSON response. This should only be sent via email.
- **Fix:** Removed the token from the response. Added a TODO comment for email integration.

### 9. Resend verification token no longer exposed (`controllers/auth.controllers.js`)

- **Problem:** Same issue — token was returned in the response body.
- **Fix:** Removed from response.

### 10. Email uniqueness check on user update (`controllers/auth.controllers.js`)

- **Problem:** `updateUser` allowed changing email without checking if it was already taken, which could violate the unique constraint and crash.
- **Fix:** Added a check for existing users with the same email before updating.

## Robustness Improvements

### 11. Product routes now use `asyncWrapper` (`route/productRoutes.js`)

- **Problem:** Auth routes used `asyncWrapper` to catch async errors, but product routes did not. Unhandled rejections could crash the server.
- **Fix:** Wrapped all product route handlers with `asyncWrapper`.

### 12. Update product route now accepts image uploads (`route/productRoutes.js`)

- **Problem:** `PUT /:id` didn't use the `upload.array()` middleware, so `req.files` was always undefined on updates.
- **Fix:** Added `upload.array("images", 5)` to the PUT route.

### 13. `app.js` now uses the exported `errorHandler` (`app.js`)

- **Problem:** `errorHandler` was defined in `error.middleware.js` but never imported. The global error handler was an inline duplicate.
- **Fix:** Imported and used `errorHandler` from the middleware file.

### 14. Null checks added to `resendVerification` and `changePassword` (`controllers/auth.controllers.js`)

- **Problem:** Neither function checked if the user existed before operating on it. A deleted or invalid user would cause a crash.
- **Fix:** Added `if (!user)` guards with 404 responses.

### 15. Input validation on `changePassword` (`controllers/auth.controllers.js`)

- **Problem:** No check for missing `oldPassword` or `newPassword` fields.
- **Fix:** Added early return with 400 status if either is missing.

## Infrastructure / Dev Setup

### 16. MongoDB connection for local development (`server.js`)

- **Problem:** The project required an external MongoDB instance (local install, Docker, or Atlas) to start. Without it, the server would hang indefinitely on `mongoose.connect()` with no feedback.
- **Fix:** Added `mongodb-memory-server` as a dependency. `server.js` now detects when no external MongoDB is reachable and automatically spins up an in-memory MongoDB instance for local development. When a real `MONGODB_URI` is configured in `.env`, it uses that instead.

### 17. Missing `uploads/` directory

- **Problem:** Multer's disk storage writes to `uploads/`, but the directory didn't exist. File uploads would fail with an `ENOENT` error.
- **Fix:** Created the `uploads/` directory in the project root.

### 18. Missing `npm install`

- **Problem:** `node_modules` was not present — dependencies had never been installed.
- **Fix:** Ran `npm install` to install all dependencies.

### 19. Missing `.env` file

- **Problem:** The server requires `PORT`, `MONGODB_URI`, and `JWT_SECRET` environment variables, but no `.env` file existed.
- **Fix:** Created a starter `.env` with sensible defaults for local development.

## Deployment Readiness

### 20. Case-sensitive import paths (`controllers/`, `middlewares/`)

- **Problem:** Model imports used PascalCase (`../models/User.js`, `../models/Product.js`) but actual filenames are lowercase (`user.js`, `product.js`). Works on macOS (case-insensitive) but crashes on Linux (Railway, Docker, CI).
- **Fix:** Changed all model imports to match the actual lowercase filenames.

### 21. `mongodb-memory-server` moved to devDependencies (`package.json`)

- **Problem:** `mongodb-memory-server` was in production dependencies. It downloads a ~300MB MongoDB binary, which is unnecessary in production where a real MongoDB URI is provided.
- **Fix:** Moved to `devDependencies`. `server.js` now gracefully handles its absence in production by requiring `MONGODB_URI` to be set.
