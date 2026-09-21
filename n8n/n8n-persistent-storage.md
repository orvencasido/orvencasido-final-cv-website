# n8n Persistent Storage Architecture & Migration Guide

Yes, **100% possible!** 

By default, n8n uses SQLite (`database.sqlite`) in `/home/node/.n8n`. SQLite is great for getting started, but n8n officially recommends **PostgreSQL** for production environments because of superior concurrency, performance, automated transaction locking, and scalable execution history.

Since Supabase **is** PostgreSQL, you have two great options:

1. **Option A (Recommended): Dedicated Local PostgreSQL Container**
   - Keeps execution logs on your local machine with zero network latency.
   - Doesn't consume your Supabase cloud storage quota or connection limits.
   - 100% isolated and easy to back up with standard Docker volumes.

2. **Option B: Remote Supabase Managed PostgreSQL Database**
   - Stores all n8n workflows, credentials, and executions directly in your cloud Supabase database.
   - Automatically backed up by Supabase cloud snapshots.
   - Best if you want cloud disaster recovery.

---

## Part 1: Architecture Comparison

| Feature | Local Postgres Container (Option A) | Supabase Cloud Postgres (Option B) |
| :--- | :--- | :--- |
| **Latency** | **< 1ms** (Direct internal Docker network) | ~50ms - 150ms (Internet round-trip per step) |
| **Quota Impact** | **None** (Uses local SSD storage) | Uses Supabase DB storage & pooler limits |
| **Schema Isolation** | Full dedicated database | Isolated via custom schema (e.g. `n8n.*`) |
| **Cloud Backups** | Manual or local script (`pg_dump`) | Automated by Supabase Cloud |
| **Ideal For** | High-volume executions, heavy local workflows | Off-site backup, cloud-first management |

---

## Option A: Dedicated Local PostgreSQL Container (Docker Compose)

### 1. Updated `n8n/docker-compose.yml`

You can update [`n8n/docker-compose.yml`](file:///home/orven/Documents/orvencasido-final-cv-website/n8n/docker-compose.yml) to add a `postgres` service:

```yaml
services:
  postgres:
    image: postgres:16-alpine
    container_name: orven_n8n_postgres
    restart: unless-stopped
    environment:
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=choose_a_strong_postgres_password
      - POSTGRES_DB=n8n
    volumes:
      - n8n_postgres_data:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -h localhost -U n8n -d n8n"]
      interval: 5s
      timeout: 5s
      retries: 10

  # Automated Daily Backup Sidecar (Zero-maintenance auto-dumps to ./n8n/backups)
  postgres-backup:
    image: prodrigestivill/postgres-backup-local:16
    container_name: orven_n8n_postgres_backup
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    environment:
      - POSTGRES_HOST=postgres
      - POSTGRES_DB=n8n
      - POSTGRES_USER=n8n
      - POSTGRES_PASSWORD=choose_a_strong_postgres_password
      - SCHEDULE=@daily           # Runs every night at midnight (or @every 6h)
      - BACKUP_KEEP_DAYS=7        # Keep 7 daily backups
      - BACKUP_KEEP_WEEKS=4       # Keep 4 weekly backups
      - BACKUP_KEEP_MONTHS=6      # Keep 6 monthly backups
    volumes:
      - ./backups:/backups

  n8n:
    image: docker.n8n.io/n8nio/n8n:latest
    container_name: orven_n8n
    restart: unless-stopped
    depends_on:
      postgres:
        condition: service_healthy
    ports:
      - "127.0.0.1:5678:5678"
    environment:
      - N8N_HOST=0.0.0.0
      - N8N_PORT=5678
      - N8N_PROTOCOL=http
      - NODE_ENV=production
      - GENERIC_TIMEZONE=Asia/Manila
      - N8N_ENFORCE_SETTINGS_FILE_PERMISSIONS=true
      - N8N_BLOCK_ENV_ACCESS_IN_NODE=false
      - NODE_FUNCTION_ALLOW_BUILTIN=*
      - NODE_FUNCTION_ALLOW_EXTERNAL=*

      # === PostgreSQL Database Backend ===
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=postgres
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=n8n
      - DB_POSTGRESDB_USER=n8n
      - DB_POSTGRESDB_PASSWORD=choose_a_strong_postgres_password
      - DB_POSTGRESDB_SCHEMA=public

      # === Webhook & Admin Secret ===
      - ORVEN_ADMIN_SECRET=secret-admin-token-12345

      # === Supabase Integration for Tools ===
      - SUPABASE_URL=https://razkqzmzqdjbhjwyagnt.supabase.co
      - SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
      - SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
    volumes:
      - n8n_data:/home/node/.n8n

volumes:
  n8n_data:
    name: orven_n8n_data
  n8n_postgres_data:
    name: orven_n8n_postgres_data
```

---

## Option B: Using Supabase as the n8n Backend Database

Because Supabase is standard PostgreSQL, n8n can connect directly using your Supabase database connection string.

### Step 1: Create a Dedicated Schema in Supabase (Important!)
To prevent n8n's internal tables (`workflow_entity`, `execution_entity`, etc.) from mixing with your portfolio tables (`projects`, `experiences`, `skills`), create a dedicated schema:

Run this in your **Supabase SQL Editor**:
```sql
CREATE SCHEMA IF NOT EXISTS n8n;
```

### Step 2: Configure `n8n/docker-compose.yml` for Supabase

In your Supabase Dashboard, go to **Project Settings** -> **Database** -> **Connection Parameters**:
- Host: `db.razkqzmzqdjbhjwyagnt.supabase.co` (or your transaction pooler host)
- Port: `5432` (or pooler port `6543`)
- User: `postgres` (or `postgres.razkqzmzqdjbhjwyagnt` if using pooler)
- Password: `<your-supabase-db-password>`

Then update `n8n/docker-compose.yml`:

```yaml
    environment:
      # === Connect n8n directly to Supabase PostgreSQL ===
      - DB_TYPE=postgresdb
      - DB_POSTGRESDB_HOST=db.razkqzmzqdjbhjwyagnt.supabase.co
      - DB_POSTGRESDB_PORT=5432
      - DB_POSTGRESDB_DATABASE=postgres
      - DB_POSTGRESDB_USER=postgres
      - DB_POSTGRESDB_PASSWORD=YOUR_SUPABASE_DATABASE_PASSWORD
      - DB_POSTGRESDB_SCHEMA=n8n
      - DB_POSTGRESDB_SSL_REJECT_UNAUTHORIZED=false
```

---

## Part 2: Migrating Existing Workflows & Credentials

Before switching from SQLite to PostgreSQL, export your current active workflow and Gemini credentials so you don't lose anything:

### 1. Export from Current SQLite
Run these commands in your project root:
```bash
# Export all workflows to a JSON file
docker exec orven_n8n n8n export:workflow --all --output=/home/node/.n8n/workflows_backup.json

# Export credentials
docker exec orven_n8n n8n export:credentials --all --output=/home/node/.n8n/credentials_backup.json

# Copy backups to your host machine
docker cp orven_n8n:/home/node/.n8n/workflows_backup.json ./n8n/
docker cp orven_n8n:/home/node/.n8n/credentials_backup.json ./n8n/
```

### 2. Switch Database & Re-import
After starting n8n with PostgreSQL (Option A or Option B):
```bash
# Copy files into the fresh n8n container
docker cp ./n8n/workflows_backup.json orven_n8n:/home/node/.n8n/
docker cp ./n8n/credentials_backup.json orven_n8n:/home/node/.n8n/

# Import into the new PostgreSQL database
docker exec orven_n8n n8n import:credentials --input=/home/node/.n8n/credentials_backup.json
docker exec orven_n8n n8n import:workflow --input=/home/node/.n8n/workflows_backup.json
```

---

## Part 3: On-Demand Backup & Restore Commands

### Instant PostgreSQL Snapshot (1-Liner)
To create an immediate compressed SQL backup anytime before doing updates:
```bash
mkdir -p ./n8n/backups
docker exec -t orven_n8n_postgres pg_dump -U n8n n8n | gzip > ./n8n/backups/n8n_backup_$(date +%Y%m%d_%H%M%S).sql.gz
```

### Restore from Backup (1-Liner)
To restore your database from a `.sql.gz` snapshot:
```bash
gunzip -c ./n8n/backups/your_backup_file.sql.gz | docker exec -i orven_n8n_postgres psql -U n8n -d n8n
```

---

## Summary Recommendation

- **Local PostgreSQL with Automated Sidecar Backup (Option A)** is the gold standard for DevOps:
  - You get sub-millisecond local speed.
  - Zero load or storage consumed on your Supabase free/pro tiers.
  - Daily automatic compressed backups stored in `./n8n/backups/` with automated rotation.
  - Quick disaster recovery with a single `gunzip` command.
