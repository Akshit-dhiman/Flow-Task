# TaskFlow — Team Task Manager

A full-stack team task management application with role-based access control built for collaboration.

## 🔗 Live Demo
- **Frontend:** *your-railway-frontend-url*
- **Backend API:** *your-railway-backend-url*

## 🛠 Tech Stack
- **Frontend:** React 18, Vite, Tailwind CSS v4, React Router v6, Axios
- **Backend:** Node.js, Express 4
- **Database:** PostgreSQL
- **ORM:** Prisma 5
- **Auth:** JWT + bcrypt
- **Deployment:** Railway (monorepo with separate services)

## ✨ Features
- 🔐 User authentication (signup/login with JWT)
- 📁 Project creation and management
- 👥 Role-based project membership (Admin / Member)
- ✅ Task creation, assignment, and status tracking
- 🎯 Admin-only controls for task creation, assignment, deletion
- 📊 Dashboard with task statistics and task distribution per user
- 🔔 Overdue task detection

## 🏃 Local Setup

### Prerequisites
- Node.js 18+
- PostgreSQL database
- npm

### Backend
```bash
cd backend
npm install
```

Create `.env` file:
```
DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/teamtaskmanager
JWT_SECRET=your_super_secret_jwt_key
CLIENT_URL=http://localhost:5173
PORT=8080
```

Run migrations and start:
```bash
npx prisma migrate dev --name init
npm run dev
```

### Frontend
```bash
cd frontend
npm install
```

Create `.env` file:
```
VITE_API_URL=http://localhost:8080/api
```

Start dev server:
```bash
npm run dev
```

## 🌍 Environment Variables

### Backend
| Variable | Description |
|---|---|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `CLIENT_URL` | Frontend URL for CORS |
| `PORT` | Server port (default: 8080) |

### Frontend
| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API base URL |

## 📡 API Routes

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/signup` | Register a new user |
| POST | `/api/auth/login` | Login, returns JWT |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Route | Access |
|---|---|---|
| POST | `/api/projects` | Any logged-in user |
| GET | `/api/projects` | Get user's projects |
| GET | `/api/projects/:id` | Project members |
| PUT | `/api/projects/:id` | Admin only |
| DELETE | `/api/projects/:id` | Admin only |

### Members
| Method | Route | Access |
|---|---|---|
| POST | `/api/projects/:id/members` | Admin only |
| GET | `/api/projects/:id/members` | All members |
| DELETE | `/api/projects/:id/members/:userId` | Admin only |

### Tasks
| Method | Route | Access |
|---|---|---|
| POST | `/api/projects/:id/tasks` | Admin only |
| GET | `/api/projects/:id/tasks` | Admin: all; Member: assigned |
| GET | `/api/tasks/my` | Current user's tasks |
| PUT | `/api/tasks/:id` | Admin: full; Member: status only |
| DELETE | `/api/tasks/:id` | Admin only |

### Dashboard
| Method | Route | Description |
|---|---|---|
| GET | `/api/projects/:id/dashboard` | Task stats, overdue count |

## 🚀 Railway Deployment

### Setup
1. Push monorepo to GitHub
2. Create a new Railway project
3. Add PostgreSQL plugin

### Backend Service
- Set **Root Directory** to `backend`
- Build command: `npm install && npx prisma generate && npx prisma migrate deploy`
- Start command: `node src/server.js`
- Environment variables: `DATABASE_URL`, `JWT_SECRET`, `CLIENT_URL`, `PORT=8080`

### Frontend Service
- Set **Root Directory** to `frontend`
- Build command: `npm install && npm run build`
- Start command: *(Serve static from `dist/`)*
- Environment variables: `VITE_API_URL=<your-backend-url>/api`

## 🎭 Role-Based Access

| Feature | Admin | Member |
|---|---|---|
| Create project | ✅ | ✅ |
| View joined projects | ✅ | ✅ |
| Add/remove members | ✅ | ❌ |
| Create tasks | ✅ | ❌ |
| Assign tasks | ✅ | ❌ |
| View all project tasks | ✅ | ❌ |
| View assigned tasks | ✅ | ✅ |
| Update task status | ✅ | ✅ (own tasks) |
| Delete tasks | ✅ | ❌ |
| View dashboard | ✅ | ✅ |

## 🎬 Demo Credentials
**Admin:**
- Email: `admin@demo.com`
- Password: `password123`

**Member:**
- Email: `member@demo.com`
- Password: `password123`
