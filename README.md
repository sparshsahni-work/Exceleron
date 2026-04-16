# Exceleron

> Upload your Excel data. Generate stunning charts. Get AI-powered insights — instantly.

![Tech Stack](https://img.shields.io/badge/Stack-React%20%2B%20Node.js%20%2B%20MongoDB-informational)
![AI](https://img.shields.io/badge/AI-Insigths%20-blue)
![Charts](https://img.shields.io/badge/Charts-2D%20%2B%203D-brightgreen)

---

## What is Exceleron?

Exceleron is a full-stack analytics platform that transforms raw Excel and CSV files into interactive 2D and 3D visualizations. Upload a spreadsheet, pick your axes, and get beautiful charts alongside AI-generated insights — no data science background required.

---

## Features

- **Excel / CSV Upload** — Drag-and-drop interface with automatic header detection and data validation.
- **Custom Axis Mapping** — Choose exactly which columns map to the X and Y axes before generating a chart.
- **2D Charts** — Bar, Line, and Pie charts powered by Chart.js with live tooltips and legends.
- **3D Charts** — Interactive 3D bar charts built with React Three Fiber and Three.js — rotatable, zoomable, and exportable.
- **AI Insights** — Claude-powered analysis that detects trends, anomalies, and patterns in your data.
- **Export** — Download any chart as a PNG or PDF with a single click.
- **Upload History** — Every file you've uploaded is tracked with data point counts and reload capability.
- **Admin Panel** — Role-based access control, user management, and a platform analytics overview.
- **Admin Access Requests** — Regular users can request admin privileges; admins approve or deny via the panel.
- **Auth Flow** — Full email verification, forgot password, and reset password flows powered by Brevo.

---

## Tech Stack

### Backend
| Layer | Technology |
|---|---|
| Runtime | Node.js + Express v5 |
| Database | MongoDB (Mongoose) |
| Authentication | JWT (HTTP-only cookies) |
| AI | Anthropic Claude (`claude-sonnet-4-20250514`) |
| File Handling | Multer |
| Excel Parsing | SheetJS (`xlsx`) |
| Email | Brevo (formerly Sendinblue) via `sib-api-v3-sdk` |
| Security | Helmet, express-rate-limit, bcryptjs |

### Frontend
| Layer | Technology |
|---|---|
| Framework | React + Vite |
| Routing | React Router v6 |
| Styling | Tailwind CSS v4 |
| Animations | Framer Motion |
| HTTP Client | Axios |
| State | Zustand (`authStore`, `apiStore`) |
| 2D Charts | Chart.js + react-chartjs-2 |
| 3D Charts | React Three Fiber + Three.js + Drei |
| File Export | html2canvas + jsPDF |
| File Parsing | SheetJS (`xlsx`) |

---

## Project Structure

```
├── backend/
│   ├── controllers/
│   │   └── auth.controller.js      # signup, login, logout, verify, reset
│   ├── middleware/
│   │   ├── verifyToken.js          # JWT auth middleware
│   │   └── isAdmin.js              # Role-based access guard
│   ├── models/
│   │   ├── user.model.js           # User schema with analytics + admin requests
│   │   ├── Chart.js                # Chart schema with views/downloads tracking
│   │   └── FileUpload.js           # File metadata schema
│   ├── routes/
│   │   ├── auth.route.js           # /api/auth/*
│   │   ├── charts.js               # /api/charts/*
│   │   ├── files.js                # /api/files/*
│   │   ├── users.js                # /api/users/*
│   │   └── analytics.js            # /api/analytics/* (admin only)
│   ├── mailtrap/
│   │   ├── brevo.config.js         # Brevo API client setup
│   │   ├── emails.js               # Email sending functions
│   │   └── emailTemplates.js       # HTML email templates
│   ├── utils/
│   │   └── generateTokenAndSetCookie.js
│   ├── db/
│   │   └── connectDB.js
│   └── index.js                    # Entry point
│
└── frontend/
    └── src/
        ├── components/             # Navbar, Hero, Footer, Services, About, etc.
        ├── DashboardComponents/    # Dashboard, FileUpload, ChartDisplay, AIInsights, etc.
        ├── pages/                  # HomePage, LoginPage, SignUpPage, DashboardPage, etc.
        ├── store/
        │   ├── authStore.js        # Auth state (Zustand)
        │   └── apiStore.js         # Charts, files, user analytics (Zustand)
        └── Reactbitzs/             # Custom UI primitives (Particles, SplashCursor, etc.)
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB URI (Atlas or local)
- Brevo account + API key
- Anthropic API key (for AI Insights)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
# Database
MONGO_URI=your_mongodb_connection_string

# Server
PORT=5000
NODE_ENV=development

# Auth
JWT_SECRET=your_super_strong_jwt_secret_at_least_32_chars

# Brevo Email
BREVO_API_KEY=your_brevo_api_key
SENDER_EMAIL=your_verified_sender_email
SENDER_NAME=Exceleron

# Client
CLIENT_URL=http://localhost:5173

# File Uploads
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads/

# Admin
FIRST_ADMIN_EMAIL=your_admin_email
ADMIN_NOTIFICATION_EMAIL=your_notification_email
ADMIN_SECRET_KEY=your_admin_panel_secret
```

```bash
npm run dev
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend runs on `http://localhost:5173` and proxies API calls to `http://localhost:5000`.

---

## API Reference

### Auth — `/api/auth`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/signup` | Register a new user + send verification email | Public |
| POST | `/login` | Login with email and password | Public |
| POST | `/logout` | Clear auth cookie | Public |
| GET | `/check-auth` | Get current authenticated user | Private |
| POST | `/verify-email` | Verify email with 6-digit code | Public |
| POST | `/forgot-password` | Send password reset link | Public |
| POST | `/reset-password/:token` | Reset password using token | Public |
| POST | `/verify-admin` | Verify admin key for panel access | Private |

### Charts — `/api/charts`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Save a new chart | Private |
| GET | `/user` | Get all charts for logged-in user | Private |
| GET | `/:chartId` | Get a specific chart | Private |
| PUT | `/:chartId` | Update a chart | Private |
| DELETE | `/:chartId` | Delete a chart | Private |
| POST | `/:chartId/increment-insights` | Increment AI insights count | Private |

### Users — `/api/users`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/` | List all users | Admin |
| DELETE | `/:userId` | Delete user + all their content | Admin |
| GET | `/admin-requests` | Get pending admin access requests | Admin |
| POST | `/respond-admin-request/:userId` | Approve or deny admin request | Admin |
| POST | `/request-admin` | Submit an admin access request | Private |
| POST | `/analytics/increment` | Increment a user analytics field | Private |

### Files — `/api/files`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/upload` | Upload an Excel/CSV file | Private |

### Analytics — `/api/analytics`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/overview` | Platform-wide stats and recent activity | Admin |
| GET | `/user-activity` | Registrations, chart and file activity over time | Admin |
| GET | `/charts` | Chart type breakdown and trends | Admin |
| GET | `/health` | DB status, memory usage, uptime | Admin |

---

## Environment Variables

| Variable | Description |
|---|---|
| `MONGO_URI` | MongoDB connection string |
| `PORT` | Backend server port (default: 5000) |
| `NODE_ENV` | `development` or `production` |
| `JWT_SECRET` | Secret for signing JWTs (min 32 chars) |
| `BREVO_API_KEY` | Brevo transactional email API key |
| `SENDER_EMAIL` | Verified sender address for emails |
| `SENDER_NAME` | Display name for outgoing emails |
| `CLIENT_URL` | Frontend URL for CORS and email links |
| `MAX_FILE_SIZE` | Max upload size in bytes (default: 10MB) |
| `UPLOAD_DIR` | Directory for storing uploaded files |
| `FIRST_ADMIN_EMAIL` | Email that receives auto-admin on first signup |
| `ADMIN_NOTIFICATION_EMAIL` | Email notified on admin access requests |
| `ADMIN_SECRET_KEY` | Secret key required to access the admin panel |

---

## Known Limitations

- The `uploads/` directory is local — files are lost on server restart in stateless/ephemeral deployments (e.g. Render free tier). Consider integrating cloud storage (S3, Cloudinary) for production.
- AI Insights require a valid Anthropic API key and consume credits per generation.
- The 3D chart renderer uses `preserveDrawingBuffer: true` which may reduce GPU performance on large datasets.
- Large Excel files (>50 data points) are automatically downsampled for chart rendering performance.
- The admin panel requires both the correct user role *and* a valid `ADMIN_SECRET_KEY` — losing this key locks out panel access.

---

## License

MIT
