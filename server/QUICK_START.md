# Quick Start Guide - Yello Solar Hub Server

## 🚀 First Time Setup (5 minutes)

### Step 1: Install Dependencies

```powershell
cd server
yarn install
```

### Step 2: Setup Database

Create a PostgreSQL database:

```sql
CREATE DATABASE ysh_medusa;
CREATE USER ysh_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE ysh_medusa TO ysh_user;
```

### Step 3: Configure Environment

```powershell
# Copy example file
Copy-Item .env.example .env

# Generate secrets
$jwt = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})
$cookie = -join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | ForEach-Object {[char]$_})

Write-Host "JWT_SECRET=$jwt"
Write-Host "COOKIE_SECRET=$cookie"

# Edit .env and paste the secrets above
notepad .env
```

Update these values in `.env`:

```env
DATABASE_URL=postgres://ysh_user:your_password@localhost:5432/ysh_medusa
JWT_SECRET=<paste generated value>
COOKIE_SECRET=<paste generated value>
```

### Step 4: Run Migrations

```powershell
yarn migrate
```

### Step 5: Create Admin User

```powershell
yarn medusa user -e admin@test.com -p supersecret -i admin
```

### Step 6: Start Server

```powershell
yarn dev
```

Access:

- **API**: <http://localhost:9000>
- **Admin Dashboard**: <http://localhost:9000/app>
- **Login**: <admin@test.com> / supersecret

## ✅ Verify Installation

Test the API:

```powershell
curl http://localhost:9000/health
```

Expected response: `{"message":"OK"}`

## 🎯 Next Steps

1. **Explore Admin UI**: <http://localhost:9000/app>
2. **Check API Documentation**: See `README.md` for endpoint details
3. **Create Custom Modules**: Start in `src/modules/`
4. **Build Workflows**: Add business logic in `src/workflows/`

## 📝 Daily Development Workflow

```powershell
# Start development server
cd server
yarn dev

# In another terminal: Watch for changes
yarn build --watch

# Run migrations after model changes
yarn medusa db:generate MyModule
yarn medusa db:migrate
```

## 🐛 Troubleshooting

### "Cannot connect to database"

Check:

1. PostgreSQL is running: `Get-Service postgresql-x64-*`
2. Database exists: `psql -U postgres -l`
3. `DATABASE_URL` in `.env` is correct

### "Port 9000 already in use"

Change port in `.env`:

```env
PORT=9001
```

### "Module not found" errors

Reinstall dependencies:

```powershell
Remove-Item -Recurse -Force node_modules
yarn install
```

## 📚 Resources

- Full documentation: `README.md`
- Medusa docs: <https://docs.medusajs.com/v2>
- Project architecture: `../docs/`

---

**Ready to build!** 🎉
