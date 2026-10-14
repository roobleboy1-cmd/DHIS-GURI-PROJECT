# GURI DHIS — House Construction Management System
*(Nidaamka Maamulka Dhismaha Guryaha iyo Mashaariicda)*

**GURI DHIS** is a full-stack house construction management platform built completely from scratch. It connects property owners (clients), certified structural engineers, construction contractors, and site tradesmen (workers) into a transparent and audited lifecycle from architectural blueprints to project handover.

---

## 1. Project Architecture (Qaab-dhismeedka Mashruuca)

```
GURI-DHIS-NEW/
├── backend/                  # Node.js + Express REST API
│   ├── src/
│   │   ├── config/           # Database pool (pg) & environment config
│   │   ├── controllers/      # Business logic & parameterized SQL queries
│   │   ├── middleware/       # JWT Auth, Role RBAC, error & validation
│   │   ├── routes/           # 16 RESTful feature routes
│   │   ├── utils/            # Standardized API response formatters
│   │   └── server.js         # Express app initialization & CORS
│   ├── .env.example          # Sample environment variables
│   ├── .gitignore
│   └── package.json
│
├── frontend/                 # React 19 + Vite + Tailwind CSS
│   ├── src/
│   │   ├── api/              # Centralized Axios client with JWT interceptor
│   │   ├── components/       # Common widgets, form fields & layouts
│   │   ├── context/          # AuthContext for session management
│   │   ├── pages/            # 25 Complete role-based pages & dashboards
│   │   └── utils/            # Currency, date, and status helpers
│   ├── .env.example
│   ├── .gitignore
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── database/                 # PostgreSQL Database Schemas
│   ├── schema.sql            # 14 Production tables, ENUMs & Triggers
│   ├── seed.sql              # Initial system admin seed
│   └── README.md             # Database deployment guide (English & Somali)
│
├── .gitignore                # Root repository ignore
└── README.md                 # Complete manual & guide
```

---

## 2. Technology Stack (Teknolojiyada la Isticmaalay)

### Frontend
- **Framework**: React 19 + Vite 6
- **Styling**: Tailwind CSS v4 (Custom Brand Theme: `#123c69` primary, `#f97316` accent)
- **Routing**: React Router v7
- **HTTP Client**: Axios with automatic Bearer token injection & 401 handling
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js (ES Modules)
- **Framework**: Express.js
- **Database Driver**: `pg` (PostgreSQL Connection Pooling)
- **Authentication**: JSON Web Tokens (`jsonwebtoken`) & `bcryptjs` password hashing
- **Security & Middleware**: CORS, `express-validator`, centralized error handling

### Database
- **Engine**: PostgreSQL 14+
- **Security**: Parameterized queries ($1, $2, ...) to prevent SQL injection
- **Integrity**: Foreign keys with `ON DELETE CASCADE` / `SET NULL` and `updated_at` automated triggers

---

## 3. User Roles & Privileges (Doorka Isticmaalayaasha)

| Role | Access & Permissions |
|---|---|
| **ADMIN** | Full administrative rights: manage users (activate/deactivate), catalog houses & designs, charter projects, inspect ledger payments, system reports. |
| **ENGINEER** | Manage engineering portfolio, register tradesmen (workers), supervise assigned sites, log photographic milestones, upload blueprint permits. |
| **CLIENT** | Browse turnkey houses, bookmark favorites, submit custom construction proposals, track site progress, view invoiced payment milestones. |
| **WORKER** | View active project assignments, inspect public construction documents, adjust availability status, receive engineering notifications. |

---

## 4. Prerequisites (Shuruudaha Ka Hor inta Aadan Bilaabin)

Before running the application, make sure you have installed:
1. **Node.js** (v18.x or v20.x+ recommended) — [Download Node.js](https://nodejs.org/)
2. **PostgreSQL** (v14, v15, or v16) — [Download PostgreSQL](https://www.postgresql.org/download/)

---

## 5. Step-by-Step Setup Guide (Tallaabooyinka Diyaarinta)

### Tallaabada 1: Samee Database Cusub oo PostgreSQL ah (Create New Database)
Open your terminal (PowerShell or Command Prompt) and access PostgreSQL `psql`:

```bash
# Connect to PostgreSQL as superuser
psql -U postgres
```

Inside the PostgreSQL prompt, create a fresh database named `guri_dhis`:

```sql
CREATE DATABASE guri_dhis;
\q
```

Now execute the schema and seed scripts into `guri_dhis`:

```bash
# Apply schema (14 tables, custom ENUMs, triggers, and indexes)
psql -U postgres -d guri_dhis -f C:\Users\hp\Desktop\GURI-DHIS-NEW\database\schema.sql

# Apply seed data (Provisions initial admin account)
psql -U postgres -d guri_dhis -f C:\Users\hp\Desktop\GURI-DHIS-NEW\database\seed.sql
```

---

### Tallaabada 2: Habee Backend Environment (Configure Backend)

Navigate to the `backend` folder:
```bash
cd C:\Users\hp\Desktop\GURI-DHIS-NEW\backend
```

Create a `.env` file by copying `.env.example`:
```bash
cp .env.example .env
```

Open `.env` and fill in your actual PostgreSQL password:
```ini
PORT=5001
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@localhost:5432/guri_dhis
# Note: If no external PostgreSQL is running, the backend automatically uses
# the built-in zero-config persistent local engine in database/data!
JWT_SECRET=super_secret_jwt_key_guridhis_2026_secure
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5174
NODE_ENV=development
```

Dependencies are already installed. If you ever need to reinstall:
```bash
npm install
```

Start the Backend Server:
```bash
npm start
```
*The backend API will start on `http://localhost:5001`.*

---

### Tallaabada 3: Habee Frontend (Configure & Run Frontend)

Open a **separate terminal window** and navigate to `frontend`:
```bash
cd C:\Users\hp\Desktop\GURI-DHIS-NEW\frontend
```

Create `.env` from `.env.example`:
```bash
cp .env.example .env
```
*(The default `VITE_API_URL=http://localhost:5001/api` is pre-configured).*

Dependencies are already installed. If you need to re-install or build:
```bash
npm install
npm run dev
```
*The frontend will launch on `http://localhost:5174`.*

---

## 6. Testing Health & Verification (Tijaabinta Nidaamka)

### Test 1: API Health Check
Open your browser or run:
```bash
curl http://localhost:5001/api/health
```
Expected response:
```json
{
  "status": "ok",
  "service": "GURI DHIS API",
  "timestamp": "2026-10-13T17:40:00.000Z",
  "database": "connected"
}
```

### Test 2: Default Administrator Sign In
- **URL**: `http://localhost:5174/login`
- **Email**: `admin@guridhis.com`
- **Password**: `Admin@123`

### Test 3: New User Registration
- You can register as either **Client** or **Engineer** directly at `http://localhost:5174/register`.
- Engineers can subsequently register **Workers** directly from their `/workers` management portal.

---

## 7. Af-Soomaali: Sharaxaadda Mashruuca

Mashruuca **GURI DHIS** waa nidaam dhamaystiran oo casri ah oo loogu talagalay in lagu maamulo dhismaha guryaha, xisaabaadka, iyo shaqada injineerada:

1. **Maamulaha (Admin)**: Waxay kormeeraan dhammaan isticmaalayaasha, guryaha lagu soo bandhigo nidaamka, ansixinta mashaariicda, iyo xisaabaadka lacag bixinta.
2. **Injineerka (Engineer)**: Wuxuu maamulaa shaqaalihiisa (workers), sawirada naqshadaha, wuxuu geliyaa sawirrada iyo heerka dhismaha marba meesha uu marayo (milestones).
3. **Macaamiisha (Client)**: Waxay dhex baari karaan buugga guryaha (catalog), codsan karaan dhisme cusub, la socon karaan dhismahooda tallaabo tallaabo, waxayna arki karaan risiidhada lacag bixinta.
4. **Shaqaalaha (Worker)**: Waxay arkaan mashaariicda loo xilsaaray iyo dukumiintiyada farsamada ee loo fasaxay.

---

## 8. Habaynta Sawirrada iyo Cloudinary (Cloudinary Integration)

GURI DHIS waxay leedahay nidaam toos ah oo sawirrada guryaha loogu keydiyo **Cloudinary**.

### Sida loo xiro Cloudinary:
1. Gal [cloudinary.com](https://cloudinary.com/) oo sameyso akoon bilaash ah (Free Account).
2. Dashboard-kaaga ka soo qaad saddexdan xog:
   - **Cloud Name**
   - **API Key**
   - **API Secret**
3. Fur faylka `backend/.env` oo ku buuxi:
   ```ini
   CLOUDINARY_CLOUD_NAME=magaca_cloudkaaga
   CLOUDINARY_API_KEY=api_keygaaga
   CLOUDINARY_API_SECRET=api_secretkaaga
   ```
4. Dib u bilow server-ka: `npm start`.

*Fiiro gaar ah: Haddii aadan wali galin xogta Cloudinary, nidaamku si toos ah ayuu sawirrada ugu keydinayaa folder-ka maxalliga ah ee `/uploads` ama wuxuu isticmaalayaa sawirrada tayo sare leh ee Unsplash si nidaamku uusan marnaba u go'in.*

---

## 9. Security Highlights
- Password hashing using `bcryptjs` with salt factor 10.
- JWT tokens with role payload verification on both route and controller levels.
- Parameterized SQL queries preventing SQL injection attacks.
- Sensitive credentials, hashes, and secrets are excluded from API payloads and git tracking.
- Payment gateway status honestly identified as manual ledger records until live gateway credentials are provided.
