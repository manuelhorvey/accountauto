# DanSaviour Enterprise Statement Management

A full-stack application for managing client financial statements, daily sales, and reports with role-based access control.

---

## 📖 Overview

DanSaviour Enterprise provides an intuitive dashboard for:

- **Client Management**: CRUD operations for clients, with custom commissions and contact details.
- **Statement Tracking**: Automated calculation of net, balances, commissions, receivables/payables based on daily sales, wins, expenses, and payments.
- **Daily Sales**: Record and aggregate daily sales (Monday–Sunday) to generate weekly statements.
- **Reports**: Monthly/Yearly performance reports per client.
- **Role-Based Access**: Secure endpoints for managers and directors via JWT authentication.

---

## ⚙️ Features

- **Backend** (Node.js + Express + MongoDB)
  - Dynamic statement computations (`computeStatement`) with cascading updates.
  - Persisted `Statement` and `DailySales` collections.
  - User roles: Director (full access), Manager (limited).
  - Scheduled report generation (monthly/yearly).

- **Frontend** (Next.js 13 App Router + React + Tailwind CSS/CSS Modules)
  - Responsive dashboard with Sidebar & Navbar.
  - Pages for clients, statements, and forms to add/edit entries.
  - Secure storage of JWT tokens for API calls.
  - Modular CSS with consistent design tokens (colors, spacing, typography).

---

## 🛠 Tech Stack

| Layer        | Technology                |
| ------------ | ------------------------- |
| Backend      | Node.js, Express, Mongoose|
| Database     | MongoDB                   |
| Authentication | JWT (JSON Web Tokens)   |
| Frontend     | Next.js 13 (App Router)   |
| Styling      | Tailwind CSS & CSS Modules|
| HTTP Client  | Axios                     |

---

## 📦 Prerequisites

- [Node.js (v16+)](https://nodejs.org)
- [Yarn](https://yarnpkg.com/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

---

## 🚀 Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/your-org/dansaviour-enterprise.git
cd dansaviour-enterprise
```

### 2. Backend Setup

```bash
cd backend
yarn install
```

- Create a `.env` file:
  ```env
  MONGO_URI=mongodb://localhost:27017/dansaviour
  JWT_SECRET=your_jwt_secret
  PORT=5000
  ```

```bash
yarn dev
# Runs with nodemon on http://localhost:5000
```

### 3. Frontend Setup

```bash
cd ../frontend
yarn install
```

- Create a `.env.local` file:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5000/api
  ```

```bash
yarn dev
# Launches Next.js on http://localhost:3000
```

---

## 📂 Folder Structure

```
project-root/
├─ backend/
│  ├─ src/
│  │  ├─ controllers/
│  │  ├─ middleware/
│  │  ├─ models/      # Mongoose schemas
│  │  ├─ routes/      # Express routers
│  │  └─ index.js     # Server entry
│  └─ .env
├─ frontend/
│  ├─ app/            # Next.js App Router pages
│  │  ├─ dashboard/
│  │  │  ├─ clients/...
│  │  │  └─ statements/...
│  │  ├─ layout.js
│  │  └─ page.js      # Home
│  ├─ components/     # Reusable UI (Navbar, Sidebar, Cards)
│  ├─ lib/api.ts      # Axios instance & hooks
│  ├─ styles/
│  └─ .env.local
└─ README.md
```

---

## 🔗 API Endpoints

### Auth
- `POST /api/auth/login` — Authenticate user (returns JWT)

### Clients
- `GET /api/clients` — List all clients
- `GET /api/clients/:id` — Fetch single client
- `POST /api/clients` — Create client (Director only)
- `PUT /api/clients/:id` — Update client (Director only)
- `DELETE /api/clients/:id` — Delete client (Director only)

### Statements
- `GET /api/statements?client=<id>` — List statements for a client
- `POST /api/statements` — Add statement + daily sales
- `PUT /api/statements/:id` — Edit statement & ripple updates
- `DELETE /api/statements/:id` — Remove statement + daily sales

### Daily Sales
- `GET /api/dailySales/:statementId`
- `PUT /api/dailySales/:statementId`

### Reports
- `GET /api/reports/:clientId/:period`
- `POST /api/reports`

---

## 🤝 Contributing

1. Fork the repo
2. Create a feature branch (`git checkout -b feat/your-feature`)
3. Commit changes (`git commit -m "feat: ..."`)
4. Push to branch (`git push origin feat/your-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
