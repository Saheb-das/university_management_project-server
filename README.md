# 🏛️ University Management System – Backend

This is the backend API and realtime service for the **University Management System**, a powerful multi-role digital platform for universities and colleges. It handles authentication, user role management, finance, attendance, communication, and internal academic workflows.

---

## ⚙️ Tech Stack

| Layer       | Technology                       |
| ----------- | -------------------------------- |
| Framework   | Express.js                       |
| Database    | PostgreSQL                       |
| ORM         | Prisma                           |
| Auth        | JWT                              |
| Realtime    | Socket.IO                        |
| File Upload | Multer                           |
| Payments    | Razorpay                         |
| Deployment  | Railway / Render / Any Node host |

---

## 📁 Folder Structure

---

## 🛠️ Features

### 🔐 Authentication & Role Management

- JWT-based authentication (`jose`)
- Login/register endpoints
- Role-based access control (Superadmin, Admin, Counsellor, Exam Cell, Accountant, Teacher, Student)

### 🎓 Academic & Student Management

- Manage student profiles, attendance, and batch assignments
- Result publishing and marks tracking
- Teacher-side student evaluation

### 📦 File Uploads

- Upload project files and study materials using **Multer**
- Cloud integration ready (e.g., Cloudinary/S3)

### 💬 Realtime Communication

- Integrated **Socket.IO** namespace logic
- Room-based chat: community, classroom, dropbox, etc.

### 💰 Payments & Salary

- Students can pay **tuition fees via Razorpay**
- Admins can view and manage salary records
- Razorpay webhook support for verification

---

## 📦 Installation

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/university-management-system-backend.git

cd university-management-system-backend
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
