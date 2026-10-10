CAMPUS LOST AND FOUND MANAGEMENT SYSTEM
=======================================

Technology:
- Frontend: React + Vite + CSS
- Backend: Java Spring Boot
- Database: MySQL
- Communication: REST APIs

SETUP
-----

1. Create the database:
   CREATE DATABASE campus_lost_found;

2. Open:
   backend/lostfound/src/main/resources/application.properties

3. Replace:
   YOUR_MYSQL_PASSWORD
   with your MySQL password.

4. Start backend:
   cd backend/lostfound
   mvnw.cmd spring-boot:run

5. Start frontend in another terminal:
   cd frontend/lost-found-frontend
   npm install
   npm run dev

6. Open:
   http://localhost:5173

ADMIN
-----

Register a normal account first. Then in MySQL run:

UPDATE users
SET role = 'ADMIN'
WHERE email = 'your-email@example.com';

Log out and log in again.

MAIN FEATURES
-------------

- User registration
- User login
- Lost item reports
- Found item reports
- Search by category
- Search by location
- My Reports
- CRUD operations
- Admin dashboard
- Approve/resolve/delete reports

IMPORTANT
---------

The included application is the MVP implementation based on the supplied
Campus Lost and Found Management System abstract. JWT-based authentication,
image uploads, email notifications, automatic matching, and production
deployment are not included in this version.
