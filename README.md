#  IP Management System (Node.js + PostgreSQL)

This project provides **user authentication, role-based access control (RBAC), JWT tokens, and password recovery via email.**

---

##  Installation

###  Clone the Repository
```sh
git clone https://github.com/sirine-sudo/IP-backend.git
cd ip-management-system/ip-backend
```

###  Install Dependencies
```sh
npm install
```

---

##  Database Setup

###  Open PostgreSQL
```sh
sudo -u postgres psql
```

###  Create Database & User
```sql
CREATE DATABASE ip_management;
CREATE USER your_db_user WITH PASSWORD 'your_db_password';
GRANT ALL PRIVILEGES ON DATABASE ip_management TO your_db_user;
```

###  Create `users` Table
```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'simple-user',
    refresh_token TEXT,
    reset_token TEXT,
    reset_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

###  Exit PostgreSQL
```sh
\q
```

---

##  Start the Server
```sh
npm start
```

 **Expected Output:**
```
Server running on port 5000
PostgreSQL Connected
Table users verified/created.
```

---

## API Endpoints

| **Endpoint**                 | **Method** | **Description**       | **Auth** |
|------------------------------|-----------|-----------------------|----------|
| `/api/users/register`       | `POST`    | User signup           | ❌ Public |
| `/api/users/login`          | `POST`    | User login            | ❌ Public |
| `/api/users/forgot-password` | `POST`    | Send reset email      | ❌ Public |
| `/api/users/reset-password`  | `POST`    | Reset password        | ❌ Public |
| `/api/users/admin`           | `GET`     | Admin access          | 🔒 `admin` |
| `/api/users/ip-owner`        | `GET`     | IP owner access       | 🔒 `admin/ip-owner` |

---

