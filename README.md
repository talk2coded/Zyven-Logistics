# 🚚 Porter — Delivery Tracking System

A full-stack delivery tracking web app. Customers track shipments by ID, admin manages all deliveries from a dashboard.

---

## ✨ Features

- **Public tracker** — customers enter their tracking ID and see live status with animated truck
- **Admin dashboard** — create, edit, delete shipments; view stats
- **Printable receipts** — with sender, receiver, delivery fee & balance
- **Supabase backend** — real database, data shared across all devices
- **Animated status indicator** — truck moves when In Transit, stops when Pending/Delivered

---

## 🚀 Deploy in 4 Steps

### 1. Set up Supabase (free)

1. Go to [supabase.com](https://supabase.com) → **New Project**
2. Name it `porter` → choose a region → set a DB password
3. Once created, go to **SQL Editor → New Query**
4. Copy & paste the contents of `supabase-schema.sql` and click **Run**
5. Go to **Settings → API** and copy:
   - `Project URL`
   - `anon / public` key

### 2. Set up environment variables

```bash
cp .env.example .env
```

Edit `.env` and fill in:
```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_ADMIN_USERNAME=admin
VITE_ADMIN_PASSWORD=yourStrongPassword123
```

### 3. Deploy to Vercel

**Option A — Vercel CLI (fastest):**
```bash
npm install -g vercel
vercel
```
When prompted, add your env variables.

**Option B — GitHub + Vercel UI:**
1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. In **Environment Variables**, add all 4 variables from `.env.example`
4. Click **Deploy**

### 4. Done! 🎉

Your site is live. Share the URL with customers. Log in at `/` → **ADMIN ↗**

---

## 🛠️ Local Development

```bash
npm install
cp .env.example .env   # fill in your Supabase keys
npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## 📁 Project Structure

```
porter/
├── src/
│   ├── App.jsx           # All pages (Tracker, Login, Dashboard)
│   ├── supabaseClient.js # Supabase connection
│   ├── main.jsx          # React entry point
│   └── index.css         # Global styles & animations
├── public/
│   └── favicon.svg
├── supabase-schema.sql   # Run this in Supabase SQL editor
├── .env.example          # Copy to .env and fill in
├── index.html
├── vite.config.js
└── package.json
```

---

## 🔐 Changing Admin Password

Update `VITE_ADMIN_USERNAME` and `VITE_ADMIN_PASSWORD` in your Vercel environment variables, then redeploy.

---

## 🗺️ Tracking ID Format

Auto-generated: `PTR` + 9 random digits  
Example: `PTR847362910`

---

## 📊 Shipment Statuses

| Status | Truck | Indicator |
|--------|-------|-----------|
| Pending | Stationary (left) | 🟡 Yellow — Awaiting Dispatch |
| In Transit | Moving + bouncing | 🟢 Green pulsing — In Motion |
| Delivered | At destination (right) | 🔵 Blue — Delivered |
