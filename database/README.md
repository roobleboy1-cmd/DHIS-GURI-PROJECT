# GURI DHIS - PostgreSQL Database Setup Guide
## Hagaha Dejinta Keydka Xogta ee GURI DHIS (English & Somali)

This directory contains the production-ready database schema and initial seed data for **GURI DHIS (House Construction Management System)**.

Faylalkani waxa ay ka kooban yihiin qaab-dhismeedka rasmiga ah (schema) iyo xogta bilowga ah (seed) ee nidaamka maaraynta dhismaha guryaha ee **GURI DHIS**.

---

### Files in this directory / Faylasha ku jira galalkan:
* [`schema.sql`](file:///C:/Users/hp/.gemini/antigravity/scratch/database/schema.sql) - Complete PostgreSQL database schema with tables, enums, constraints, foreign keys, triggers, and indexes.
* [`seed.sql`](file:///C:/Users/hp/.gemini/antigravity/scratch/database/seed.sql) - Initial administrator seed user (`admin@guridhis.com` / `Admin@123`).
* [`README.md`](file:///C:/Users/hp/.gemini/antigravity/scratch/database/README.md) - This setup guide (English & Af-Soomaali).

---

## Table of Contents / Tusmada

1. [English Guide](#english-guide)
   - [1. Install PostgreSQL](#1-install-postgresql)
   - [2. Create Database (`guri_dhis`)](#2-create-database-guri_dhis)
   - [3. Execute `schema.sql`](#3-execute-schemasql)
   - [4. Execute `seed.sql`](#4-execute-seedsql)
   - [5. Verify the Tables](#5-verify-the-tables)
   - [6. Default Admin Credentials](#6-default-admin-credentials)
2. [Hagaha Af-Soomaaliga (Somali Guide)](#hagaha-af-soomaaliga-somali-guide)
   - [1. Ku Rakibidda PostgreSQL Kumbuyuutarkaaga](#1-ku-rakibidda-postgresql-kumbuyuutarkaaga)
   - [2. Abuurista Database-ka (`guri_dhis`)](#2-abuurista-database-ka-guri_dhis)
   - [3. Dhaqangelinta `schema.sql`](#3-dhaqangelinta-schemasql)
   - [4. Dhaqangelinta `seed.sql`](#4-dhaqangelinta-seedsql)
   - [5. Hubinta Miisaska (Tables)](#5-hubinta-miisaska-tables)
   - [6. Xogta Galitaanka ee Maamulaha (Admin Credentials)](#6-xogta-galitaanka-ee-maamulaha-admin-credentials)
3. [Database Schema Overview](#database-schema-overview)

---

## English Guide

### 1. Install PostgreSQL

#### On Windows:
1. Download the official PostgreSQL installer from:
   [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Run the installer (PostgreSQL 14, 15, or 16 recommended).
3. Keep the default components: PostgreSQL Server, pgAdmin 4, Command Line Tools.
4. Set a strong password for the default `postgres` superuser (remember this password).
5. Default port is `5432`. Finish installation.
6. Alternatively, via Windows Package Manager (PowerShell):
   ```powershell
   winget install PostgreSQL.PostgreSQL
   ```

#### On macOS:
Install via Homebrew:
```bash
brew install postgresql@16
brew services start postgresql@16
```

#### On Ubuntu / Debian Linux:
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

---

### 2. Create Database (`guri_dhis`)

Open your terminal, command prompt, or PowerShell and run:

```bash
# Log in to psql as the postgres user
psql -U postgres
```

When prompted, type your `postgres` password, then execute:

```sql
-- Create the database
CREATE DATABASE guri_dhis WITH ENCODING 'UTF8';

-- Exit psql
\q
```

*Or run directly in one command:*
```bash
createdb -U postgres guri_dhis
```

---

### 3. Execute `schema.sql`

Navigate to the directory where the database files are located, then execute the schema against `guri_dhis`:

#### Command Line / PowerShell:
```bash
psql -U postgres -d guri_dhis -f schema.sql
```

#### From inside `psql`:
```sql
\c guri_dhis
\i 'schema.sql'
```

#### Using pgAdmin 4:
1. Open **pgAdmin 4** and connect to your server.
2. Right-click on **Databases** > **Refresh**, then expand `guri_dhis`.
3. Right-click `guri_dhis` and select **Query Tool**.
4. Click the **Open File** icon (folder icon), browse to `schema.sql`, and open it.
5. Click the **Execute/Run** button (play icon or press `F5`).

---

### 4. Execute `seed.sql`

Once the schema tables are created, seed the initial administrator user:

#### Command Line / PowerShell:
```bash
psql -U postgres -d guri_dhis -f seed.sql
```

#### From inside `psql`:
```sql
\c guri_dhis
\i 'seed.sql'
```

#### Using pgAdmin 4:
1. In the **Query Tool** connected to `guri_dhis`, open `seed.sql`.
2. Click **Execute** (`F5`).

---

### 5. Verify the Tables

Connect to `guri_dhis` and inspect the created schema:

```bash
psql -U postgres -d guri_dhis
```

Inside `psql`, run:
```sql
-- 1. List all 14 tables
\dt

-- 2. List all custom ENUM types
\dT

-- 3. Check the seeded admin user
SELECT id, email, full_name, role, is_active, created_at FROM users;

-- 4. Check table structure of projects and payments
\d projects
\d payments
```

You should see 14 tables:
1. `users`
2. `engineer_profiles`
3. `worker_profiles`
4. `houses`
5. `house_designs`
6. `construction_requests`
7. `projects`
8. `project_workers`
9. `project_progress`
10. `project_documents`
11. `payments`
12. `favorites`
13. `notifications`
14. `reviews`

---

### 6. Default Admin Credentials

| Field | Value | Notes |
| :--- | :--- | :--- |
| **Email** | `admin@guridhis.com` | Root system administrator |
| **Password** | `Admin@123` | Bcrypt hashed in database |
| **Role** | `admin` | Full system access |

> [!IMPORTANT]
> Change the default admin password immediately upon first production deployment! All additional users (Engineers, Clients, and Workers) must register through the web application interface.

---

## Hagaha Af-Soomaaliga (Somali Guide)

### 1. Ku Rakibidda PostgreSQL Kumbuyuutarkaaga

#### Windows:
1. Ka soo deji bogga rasmiga ah ee PostgreSQL:
   [https://www.postgresql.org/download/windows/](https://www.postgresql.org/download/windows/)
2. Furo faylka aad soo dejisay oo raac tallaabooyinka (Next > Next).
3. Dooro waxyaabaha caadiga ah: Server, pgAdmin 4, iyo Command Line Tools.
4. Geli furaha sirta ah (password) ee isticmaalaha guud ee `postgres`. (Xusuusnow furahan waayo waad u baahan doontaa markasta).
5. Port-ka u daa `5432` oo dhammeystir rakibidda.

#### macOS:
Waxaad ku rakiban kartaa adigoo isticmaalaya Homebrew:
```bash
brew install postgresql@16
brew services start postgresql@16
```

#### Ubuntu / Debian Linux:
```bash
sudo apt update
sudo apt install -y postgresql postgresql-contrib
sudo systemctl enable --now postgresql
```

---

### 2. Abuurista Database-ka (`guri_dhis`)

Fur Terminal-ka, Command Prompt (cmd) ama PowerShell, kadibna qor:

```bash
# Gal barnaamijka psql adigoo isticmaalaya isticmaalaha postgres
psql -U postgres
```

Geli furahaaga sirta ah (password), kadibna qor amarkan:

```sql
-- Abuuro keydka xogta ee guri_dhis
CREATE DATABASE guri_dhis WITH ENCODING 'UTF8';

-- Ka bax psql
\q
```

*Ama waxaad ku abuuri kartaa hal amar oo toos ah:*
```bash
createdb -U postgres guri_dhis
```

---

### 3. Dhaqangelinta `schema.sql`

Tag galalka (folder-ka) ay ku jiraan faylashan, kadibna ku shub nidaamka miisaska database-ka `guri_dhis`:

#### Isticmaalka Terminal / PowerShell:
```bash
psql -U postgres -d guri_dhis -f schema.sql
```

#### Haddii aad ku dhex jirto `psql`:
```sql
\c guri_dhis
\i 'schema.sql'
```

#### Isticmaalka pgAdmin 4 (Qalabka Muuqaalka leh):
1. Furo **pgAdmin 4** oo gal server-kaaga.
2. Dhinaca bidix ka dooro **Databases** > ku dhufo `guri_dhis`.
3. Midigta ku dhufo `guri_dhis` oo dooro **Query Tool**.
4. Guji astaanta fayl furista (folder icon), soo dooro faylka `schema.sql`.
5. Guji batoonka orodka (Play icon) ama riix batoonka `F5` ee kiiboodhkaaga.

---

### 4. Dhaqangelinta `seed.sql`

Marka aad dhammeyso diyaarinta miisaska (schema), ku shub xogta koontada maamulaha koowaad (admin user):

#### Isticmaalka Terminal / PowerShell:
```bash
psql -U postgres -d guri_dhis -f seed.sql
```

#### Haddii aad ku dhex jirto `psql`:
```sql
\c guri_dhis
\i 'seed.sql'
```

#### Isticmaalka pgAdmin 4:
1. Dhex fur **seed.sql** adigoo isticmaalaya **Query Tool** ee ku xiran `guri_dhis`.
2. Guji **Execute** (`F5`).

---

### 5. Hubinta Miisaska (Tables)

Si aad u hubiso in 14-ka miis iyo xogtu si sax ah u galeen, gal `psql`:

```bash
psql -U postgres -d guri_dhis
```

Qor amarradan:
```sql
-- 1. Fiiri dhammaan miisaska (tables) la abuuray
\dt

-- 2. Fiiri noocyada ENUM-yada la sameeyay
\dT

-- 3. Fiiri xogta maamulaha (admin) ee ku jirta miiska users
SELECT id, email, full_name, role, is_active FROM users;
```

Waa in ay kuu soo baxaan 14-kan miis ee hoos ku qoran:
1. `users` - Xogta guud ee isticmaaleyaasha iyo furayaasha sirta ah
2. `engineer_profiles` - Profile-ka injineerrada, khibradooda iyo shahaadooyinkooda
3. `worker_profiles` - Profile-ka shaqaalaha muruq-maalka ah, xirfadahooda iyo qiimaha maalinkii
4. `houses` - Moodeellada guryaha la dhisayo ama la iibinayo
5. `house_designs` - Naqshadaha guryaha (Blueprints, sawirrada 3D, iyo qiimaha qiyaasta)
6. `construction_requests` - Dalabaadka macaamiishu soo dirsadaan
7. `projects` - Mashaariicda dhismaha ee heshiiska lagu galay
8. `project_workers` - Shaqaalaha loo xilsaaray mashruuc kasta
9. `project_progress` - Heerka dhismaha iyo sawirrada horumarka shaqada
10. `project_documents` - Dukumeentiyada dhismaha (ogolaanshaha dawladda, naqshadaha, iwm.)
11. `payments` - Lacagaha la bixiyo (EVC Plus, ZAAD, Sahal, iyo Akoonnada Bangiga)
12. `favorites` - Guryaha macaamiishu calaamadsadaan inay ka heleen
13. `notifications` - Fariimaha iyo ogeysiisyada loo diro dadka nidaamka isticmaalaya
14. `reviews` - Qiimeynta iyo faallooyinka injineerrada iyo mashaariicda

---

### 6. Xogta Galitaanka ee Maamulaha (Admin Credentials)

| Xogta | Qiimaha | Faahfaahin |
| :--- | :--- | :--- |
| **Email** | `admin@guridhis.com` | Email-ka maamulaha sare |
| **Password** | `Admin@123` | Furaha sirta ah (wuxuu ku keydsan yahay bcrypt hash) |
| **Role** | `admin` | Awoodda ugu sareysa ee nidaamka |

> [!WARNING]
> Fadlan beddel furaha sirta ah ee maamulaha marka ugu horreysa ee aad nidaamka internetka geliso (Production). Isticmaaleyaasha kale oo dhan (Injineerrada, Macaamiisha, iyo Shaqaalaha) waa in ay iska soo diiwaangeliyaan bogga nidaamka (Sign Up).

---

## Database Schema Overview

```
users (1) ────┬──── (1) engineer_profiles
              ├──── (1) worker_profiles
              ├──── (N) houses (created_by)
              ├──── (N) construction_requests (client_id, engineer_id)
              ├──── (N) projects (client_id, engineer_id)
              ├──── (N) project_workers (worker_id)
              ├──── (N) payments (client_id)
              ├──── (N) favorites (user_id)
              ├──── (N) notifications (user_id)
              └──── (N) reviews (reviewer_id, reviewee_id)

houses (1) ───┬──── (N) house_designs
              ├──── (N) construction_requests
              └──── (N) favorites

projects (1) ─┬──── (N) project_workers
              ├──── (N) project_progress
              ├──── (N) project_documents
              ├──── (N) payments
              └──── (N) reviews
```
