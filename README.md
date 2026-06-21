# Fullstack App

A personal document management portal built with Angular 17 and Node.js/Express. Users can register, log in, manage their personal details, upload file attachments, and export their profile as PDF or DOCX.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | Angular 17, TypeScript |
| Backend | Node.js, Express 4 |
| Database | MongoDB (Mongoose) |
| Auth | JWT + bcrypt |
| Documents | PDFKit, DOCX |
| File Uploads | Multer |

---

## Features

- User registration and login with CAPTCHA verification
- JWT-based authentication with route guards and HTTP interceptors
- Personal details form with file attachments (JPEG, PNG, PDF — max 5 files, 5 MB each)
- Export profile as PDF or Word document
- Password change with current-password verification
- Attachment management (upload and delete)

---

## Project Structure

```
fullstack-app/
├── backend/
│   ├── config/          # MongoDB connection
│   ├── controllers/     # Auth, profile, document logic
│   ├── middleware/      # JWT verification
│   ├── models/          # Mongoose User schema
│   ├── routes/          # API route definitions
│   ├── uploads/         # Stored user files
│   └── server.js        # Express entry point
└── frontend/
    └── src/app/
        ├── components/  # Login, Register, Navbar, Profile, PersonalDetails
        ├── services/    # Auth, User, Document HTTP services
        ├── guards/      # AuthGuard for protected routes
        ├── interceptors/# Token injection
        └── models/      # TypeScript interfaces
```

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18+
- [MongoDB](https://www.mongodb.com/) running locally on port `27017`
- [Angular CLI](https://angular.io/cli) v17 (`npm install -g @angular/cli`)

---

## Getting Started

### 1. Clone the repository

```bash
git clone <repository-url>
cd fullstack-app
```

### 2. Configure the backend

```bash
cd backend
cp .env.example .env   # .env is gitignored — never commit it
```

Edit `.env` and set your values:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fullstack_app
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

### 3. Install dependencies and start the backend

```bash
# inside backend/
npm install
npm run dev        # development (nodemon, auto-restart)
# or
npm start          # production
```

Backend runs at `http://localhost:5000`.

### 4. Install dependencies and start the frontend

```bash
cd ../frontend
npm install
npm start
```

Frontend runs at `http://localhost:4200`.

---

## API Reference

Base URL: `http://localhost:5000/api`

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Login (returns JWT) |
| GET | `/me` | Yes | Get current user |

### Profile — `/api/profile`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | Yes | Fetch user profile |
| PUT | `/personal-details` | Yes | Update personal info + upload files |
| PUT | `/change-password` | Yes | Change password |
| DELETE | `/attachments/:attachmentId` | Yes | Delete an attachment |

### Documents — `/api/documents`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/pdf` | Yes | Download profile as PDF |
| GET | `/docx` | Yes | Download profile as Word document |

---

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Backend server port |
| `MONGODB_URI` | `mongodb://localhost:27017/fullstack_app` | MongoDB connection string |
| `JWT_SECRET` | — | Secret key for signing JWTs (required) |

---

## Available Scripts

### Backend

```bash
npm run dev    # Start with nodemon (development)
npm start      # Start with node (production)
```

### Frontend

```bash
npm start        # Serve on http://localhost:4200
npm run build    # Production build → dist/fullstack-app/
npm run watch    # Watch mode build
```

---

## File Upload Constraints

- Allowed types: JPEG, PNG, PDF
- Max file size: 5 MB per file
- Max files per upload: 5

---

## License

MIT
