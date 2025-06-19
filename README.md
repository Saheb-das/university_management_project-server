# 🏛️ University Management System – Backend

This is the backend API and realtime service for the **University Management System**, a powerful multi-role digital platform for universities and colleges. It handles authentication, user role management, finance, attendance, communication, and internal academic workflows.

---

## ⚙️ Tech Stack

| Layer       | Technology                       |
| ----------- | -------------------------------- |
| Language    | Typescript                       |
| Framework   | Express.js                       |
| Database    | PostgreSQL                       |
| ORM         | Prisma                           |
| Auth        | JWT                              |
| Realtime    | Socket.IO                        |
| File Upload | Multer                           |
| Payments    | Razorpay                         |
| Deployment  | Railway / Render / Any Node host |

---

## 📁 Project Folder Structure

```bash
📁 server/                          # Root backend directory
├── 📁 dist/                        # Compiled JavaScript output (after build)
├── 📁 prisma/                      # Prisma schema and migrations
│   ├── migrations/
│   └── schema.prisma
├── 📁 src/                         # Source code (TypeScript)
│   ├── 📁 cache/                   # Caching logic (e.g., NodeCache)
│   ├── 📁 config/                  # App configuration (DB, server, etc.)
│   ├── 📁 controllers/             # Route controllers
│   ├── 📁 lib/                     # External libraries or helper modules
│   ├── 📁 middleware/              # Express middlewares (auth, error handling)
│   ├── 📁 multer/                  # File upload logic
│   ├── 📁 razorpay/                # Razorpay payment integration
│   ├── 📁 repository/              # Data access layer (Prisma calls)
│   ├── 📁 routes/                  # Express route definitions
│   ├── 📁 service/                 # Business logic
│   ├── 📁 socket/                  # Socket.IO logic and handlers
│   ├── 📁 types/                   # TypeScript custom types and interfaces
│   ├── 📁 utils/                   # Utility functions
│   ├── 📁 zod/                     # Zod schemas for validation
│   └── index.ts                   # App entry point
├── .env                           # Environment variables
├── package.json
├── tsconfig.json
└── README.md


```

---

## 🛠️ Features

### 🔐 Authentication & Role Management

- JWT-based authentication
- Login/register endpoints
- Role-based access control (Superadmin, Admin, Counsellor, Exam Cell, Accountant, Teacher, Student)

### 🎓 Academic & Student Management

- Manage student profiles, attendance, and batch assignments
- Result publishing and marks tracking
- Teacher-side student evaluation

### 📦 File Uploads

- Upload project files and study materials using **Multer**

### 💬 Realtime Communication

- Integrated **Socket.IO** namespace logic
- Room-based chat: community, classroom, dropbox, etc.

### 💰 Payments & Salary

- Students can pay **tuition fees via Razorpay**
- Accountant can view and manage salary records

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/Saheb-das/university_management_project-server.git

cd university_management_project-server
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Setup Environment Variables

Create a `.env` file in the root directory and add the following:

```env
PORT = 8080

DATABASE_URL= postgresql://user:password@localhost:5432/university_db

RAZORPAY_KEY_ID= your_razorpay_key
RAZORPAY_SECRET= your_razorpay_secret

JWT_SECRET_KEY = "jwt_secret_key"

GMAIL_HOST = "gmail_host"
GMAIL_USER = "emaxple@gmail.com"
GMAIL_APP_PASS = "gmail_app_pass_key"
```

### 4. Initialize Prisma

```bash
npx prisma migrate dev --name init
npx prisma generate
```

### 4. Initialize Prisma

```bash
npm run dev
```
