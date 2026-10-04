# A u.S Wirtschaftsberatung e.K. - Customer Portal

Production-ready client booking and advisory management web application for **A u.S Wirtschaftsberatung e.K.** Built with React 19, Vite, TypeScript, and modern styling.

---

## 🌟 Key Features

- **Multi-Language Support:** Native German (de), English (en), and Urdu (ur with RTL support).
- **Online Appointment Booking:** Interactive step-by-step consultation booking flow with automatic slot availability validation.
- **Client Dashboard:** Real-time overview of active and past consultations, status tracking, and appointment details.
- **Live Advisor Chat Hub:** Direct real-time communication with Kanzlei advisors via WebSockets.
- **Secure Authentication:** Client account registration, login, and profile management with token persistence.
- **Responsive & Modern UI:** Glassmorphism accents, smooth animations, and optimized mobile & desktop layouts.

---

## 🛠️ Tech Stack

- **Framework:** React 19 + TypeScript
- **Bundler & Build Tool:** Vite
- **Styling:** Tailwind CSS + Lucide Icons
- **Deployment Platform:** Vercel (100% Free Tier compatible)

---

## 🚀 Getting Started Locally

### 1. Prerequisites
- Node.js >= 20.0.0
- npm >= 10.0.0

### 2. Installation
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file based on `.env.example`:
```bash
cp .env.example .env
```
Fill in the following variables:
```env
VITE_API_URL=http://localhost:3000
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Production Build
```bash
npm run build
```

---

## ☁️ Free Deployment to Vercel

1. Push this repository to your GitHub account.
2. Sign in to [Vercel](https://vercel.com) using your GitHub account.
3. Click **"Add New..."** -> **"Project"**.
4. Select your **`aus-customer-portal`** repository.
5. In Project Settings:
   - **Framework Preset:** `Vite`
   - **Root Directory:** `./`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Under **Environment Variables**, add:
   - `VITE_API_URL`: URL of your deployed backend server (e.g. `https://aus-server.koyeb.app`)
   - `VITE_SUPABASE_URL` (optional)
   - `VITE_SUPABASE_ANON_KEY` (optional)
7. Click **Deploy**. Vercel will build and assign you a free `*.vercel.app` domain with automatic SSL and global CDN.

---

## 📄 License
Private & Proprietary - A u.S Wirtschaftsberatung e.K.
