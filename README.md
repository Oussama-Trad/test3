# LEONI Authentication System

This repository contains two distinct projects for the LEONI authentication system:

## 📋 Overview

- **Admin Site**: Spring Boot application for admin/superadmin access
- **Mobile App**: React Native (Expo) + Flask backend for employee access
- **Database**: MongoDB (DBLEONI) shared between both projects

## 🗂️ Project Structure

```
Stage3/
├── Admin/                    # Spring Boot Admin Site
│   └── src/main/java/com/Admin/Admin/
├── AppMobile/               # React Native Mobile App
│   └── backend/            # Flask backend
├── mongodb-setup.js       # MongoDB initialization script
└── README.md
```

## 🔐 Authentication System

### Collections Created:
1. **employee** - Mobile app users
2. **admin** - Web admin users (limited access)
3. **superadmin** - Web admin users (full access)

### Access Rules:
- **Employees**: Mobile app only
- **Admins**: Web admin only (limited to their location/department)
- **Superadmins**: Web admin only (full access to all locations/departments)

## 🚀 Setup Instructions

### 1. MongoDB Setup

Run the MongoDB initialization script:
```bash
# Connect to MongoDB and run:
mongo mongodb-setup.js
```

### 2. Admin Site (Spring Boot)

#### Prerequisites:
- Java 17+
- Maven 3.6+
- MongoDB connection

#### Configuration:
The application is pre-configured with:
- MongoDB URI: `mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/DBLEONI`
- JWT Secret: `123`
- Port: `8080`

#### Run:
```bash
cd Admin
./mvnw spring-boot:run
```

### 3. Mobile App Backend (Flask)

#### Prerequisites:
- Python 3.8+
- Virtual environment

#### Setup:
```bash
cd AppMobile/backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

#### Run:
```bash
python app.py
```

### 4. Mobile App (React Native)

#### Prerequisites:
- Node.js 16+
- Expo CLI
- Android Studio / Xcode (for emulator)

#### Setup:
```bash
cd AppMobile
npm install
```

#### Run:
```bash
npm start
```

## 🔑 Default Credentials

### Super Admin (Web)
- Email: `superadmin@leoni.com`
- Password: `superadmin123`

### Admin (Web)
- Create through admin registration endpoint

### Employee (Mobile)
- Register through mobile app registration

## 📡 API Endpoints

### Admin Site (Spring Boot)
- `POST /api/auth/register` - Admin registration
- `POST /api/auth/login` - Admin login
- `GET /api/admin/profile` - Get admin profile

### Mobile App (Flask)
- `POST /api/register` - Employee registration
- `POST /api/login` - Employee login
- `GET /api/profile` - Get employee profile

## 🔧 Environment Variables

### Common
- `JWT_SECRET_KEY=123`
- `MONGODB_URI=mongodb+srv://oussamatrzd19:oussama123@leoniapp.grhnzgz.mongodb.net/`

### Admin Site
- `SERVER_PORT=8080`

### Mobile Backend
- `FLASK_PORT=5000`

## 🛡️ Security Features

- Password hashing (bcrypt)
- JWT token authentication
- Role-based access control
- Input validation
- Rate limiting (recommended for production)

## 📊 Database Schema

### Employee Collection
```json
{
  "nom": "string",
  "prenom": "string",
  "id": "string (8 digits)",
  "adresse1": "string",
  "adresse2": "string",
  "numTel": "string",
  "numTelParentale": "string",
  "location": "string",
  "departement": "string",
  "photoDeProfil": "string",
  "password": "hashed",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Admin Collection
```json
{
  "nom": "string",
  "prenom": "string",
  "adresse": "string",
  "numTel": "string",
  "location": "string",
  "departement": "string",
  "email": "string",
  "password": "hashed",
  "role": "admin"
}
```

### SuperAdmin Collection
```json
{
  "nom": "string",
  "prenom": "string",
  "adresse": "string",
  "numTel": "string",
  "email": "string",
  "password": "hashed",
  "location": "all",
  "departement": "all",
  "role": "superadmin"
}
```

## 🧪 Testing

### Admin Site
- Use Postman or similar tool to test endpoints
- Test with different roles (admin/superadmin)

### Mobile App
- Use Expo Go app on device
- Test employee registration and login

## 📞 Support

For issues or questions:
1. Check the logs for both applications
2. Verify MongoDB connection
3. Ensure all environment variables are set correctly
4. Check JWT token validity

## 📝 Notes

- Each project is independent and should not modify the other
- Follow MVC architecture strictly
- Use the provided JWT secret key for development
- Consider using environment variables for production
- Implement rate limiting for production use
