# Database setup (Phase 0.4)

## 1. Create MySQL database

Create the database once before running the backend.

**Option A – SQL script (recommended)**

1. Set the database name in `server/.env`:
   ```env
   DATABASE_SERVICE_API_DB=hostel_erp
   DATABASE_SERVICE_API_NAME=your_mysql_user
   DATABASE_SERVICE_API_PASSWORD=your_mysql_password
   ```
2. Use the same name in the script, then run:
   ```bash
   cd server
   mysql -u root -p < scripts/create-database.sql
   ```
   Or open `scripts/create-database.sql`, replace `hostel_erp` with your `DATABASE_SERVICE_API_DB` value, and run it in your MySQL client.

**Option B – Manual**

In your MySQL client (e.g. MySQL Workbench, DBeaver, or `mysql` CLI):

```sql
CREATE DATABASE IF NOT EXISTS your_db_name
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

Use the same name for `DATABASE_SERVICE_API_DB` in `server/.env`.

## 2. Configure .env

Copy `server/.env.example` to `server/.env` and set at least:

- `DATABASE_HOST`, `DATABASE_PORT`, `DATABASE_DIALECT=mysql`
- `DATABASE_SERVICE_API_DB` (database name from step 1)
- `DATABASE_SERVICE_API_NAME`, `DATABASE_SERVICE_API_PASSWORD`
- `PORT`, `REACT_HOST`, `API_HOST`

## 3. Run the backend

Start the server once:

```bash
cd server
npm start
```

`initializeDatabase()` in `app.js` will:

1. Connect to MySQL using your config.
2. Call `db.sequelize.sync()` so Sequelize creates all tables from the models.

After you see “Database sync success.” in the logs, the database is ready.

## Candidate registration prefix

Candidate IDs are generated in `server/controllers/candidateDetails.controller.js` via `generateCandidateRegNo()`. The prefix is **Hh** (Hostel Host ERP). Format: `Hh` + 3-letter city code + 4-digit number (e.g. `HhBLR0001`).
