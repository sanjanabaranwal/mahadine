# MAHADINE — Smart Restaurant Table Reservation System

A full-stack restaurant table reservation platform built with **Java Spring Boot**, **MySQL**, and **vanilla HTML/CSS/JavaScript**, themed in **olive green & cream**. Built as a college full-stack project, deployable to **Railway**.

Guests can browse restaurants across Mumbai & Maharashtra, check real-time table availability, and book a table in a few clicks. Admins get a full dashboard to manage restaurants, tables, reservations, and users.

---

## 1. Features

**Guest side**
- Register / login (JWT-based auth, passwords hashed with BCrypt)
- Browse & search restaurants by city, cuisine, or keyword
- View restaurant details, hours, and guest reviews
- Pick a date, time & guest count, see live table availability
- Book a table (server validates everything — no double-booking possible)
- View, filter, and cancel your own reservations
- Edit your profile (name, phone, password)

**Admin side**
- Separate admin login (`/admin/login.html`), enforced by role on the backend
- Dashboard with live stats (users, restaurants, tables, reservations, today's bookings, status breakdown)
- Full restaurant CRUD (add / edit / delete)
- Full table CRUD per restaurant
- View & update every reservation's status
- View all registered users
- Basic analytics (popular restaurants, status breakdown)

---

## 2. Technology Stack

| Layer | Technology |
|---|---|
| Frontend | HTML5, CSS3, Vanilla JavaScript (no framework) |
| Backend | Java 17, Spring Boot 3.3, Spring Web, Spring Data JPA, Spring Security |
| Auth | JWT (jjwt) + BCrypt password hashing |
| Database | MySQL |
| Build | Maven |
| Deployment | Railway (Docker) |
| Version control | GitHub |

---

## 3. Folder Structure

```
mahadine/
├── backend/                        # Spring Boot application
│   ├── pom.xml
│   ├── Dockerfile
│   ├── .env.example
│   └── src/main/
│       ├── java/com/mahadine/
│       │   ├── MahadineApplication.java
│       │   ├── config/            # Security, CORS, demo-data seeding
│       │   ├── controller/        # REST controllers
│       │   ├── dto/               # Request/response objects
│       │   ├── entity/            # JPA entities + enums
│       │   ├── repository/        # Spring Data JPA repositories
│       │   ├── service/           # Business logic
│       │   ├── exception/         # Centralized error handling
│       │   ├── security/          # JWT filter/service, UserDetailsService
│       │   └── util/              # Validation helpers
│       └── resources/
│           ├── application.properties       # local dev config
│           ├── application-prod.properties  # Railway config
│           └── static/            # <-- the built frontend is served from here
│
├── frontend/                       # Source of truth for the frontend
│   ├── *.html                     # 11 guest-facing pages
│   ├── css/                       # style.css, responsive.css, auth.css, dashboard.css, booking.css
│   ├── js/                        # api.js, auth.js, main.js, restaurants.js, ...
│   └── admin/                     # 8 admin pages + admin/css + admin/js
│
├── database/
│   ├── schema.sql                 # reference schema (informational)
│   └── data.sql                   # reference seed data (informational)
│
├── .gitignore
└── README.md
```

> **Note:** `frontend/` is copied into `backend/src/main/resources/static/` so that the single Spring Boot service serves both the API (`/api/**`) and the website (`/`). This is why the same files exist in both places — edit `frontend/`, then re-copy into `backend/src/main/resources/static/` before rebuilding (see Local Setup below).

---

## 4. Database Design (ER overview)

```
users (1) ───< (M) reservations (M) >─── (1) restaurant_tables
  │                                              │
  │                                              │ (M)
  │                                              │
  │                                        (1) restaurants
  │                                              │
  └────< (M) reviews >──────────────────────────┘
users (1) ───< (M) contact_messages   (no FK — public contact form)
```

- **users**: id, name, email (unique), password (BCrypt), phone, role (`USER`/`ADMIN`), enabled, timestamps
- **restaurants**: id, name, description, location, city, address, phone, email, cuisine, price_range, rating, opening_time, closing_time, image_url, status, timestamps
- **restaurant_tables**: id, restaurant_id (FK), table_number, capacity, table_type, status (`AVAILABLE`/`RESERVED`/`MAINTENANCE`)
- **reservations**: id, user_id (FK), restaurant_id (FK), table_id (FK), reservation_date, reservation_time, number_of_guests, status (`PENDING`/`CONFIRMED`/`CANCELLED`/`COMPLETED`), special_request, timestamps
- **reviews**: id, user_id (FK), restaurant_id (FK), rating, comment, created_at
- **contact_messages**: id, name, email, subject, message, created_at

The database itself is named `mahadine` locally (`smart_restaurant` in the reference `schema.sql`, adjust `DB_NAME` if you prefer that name). Tables are created/updated automatically by Hibernate (`spring.jpa.hibernate.ddl-auto=update`) — you do not need to run any SQL by hand.

---

## 5. API Endpoints

**Auth** — `POST /api/auth/register`, `POST /api/auth/login`, `GET /api/auth/me`, `POST /api/auth/logout`
**Users** — `GET /api/users/profile`, `PUT /api/users/profile`
**Restaurants** — `GET /api/restaurants`, `GET /api/restaurants/{id}`, `POST /api/restaurants` (admin), `PUT /api/restaurants/{id}` (admin), `DELETE /api/restaurants/{id}` (admin)
**Tables** — `GET /api/restaurants/{id}/tables`, `POST /api/restaurants/{id}/tables` (admin), `PUT /api/tables/{id}` (admin), `DELETE /api/tables/{id}` (admin)
**Availability** — `GET /api/restaurants/{id}/availability?date=&time=&guests=`
**Reservations** — `POST /api/reservations`, `GET /api/reservations/my`, `GET /api/reservations/{id}`, `PUT /api/reservations/{id}/cancel`
**Reviews** — `GET /api/restaurants/{id}/reviews`, `POST /api/restaurants/{id}/reviews`
**Contact** — `POST /api/contact`
**Admin** — `GET /api/admin/dashboard`, `GET /api/admin/users`, `GET /api/admin/restaurants`, `GET /api/admin/reservations`, `PUT /api/admin/reservations/{id}/status` (Confirm/Cancel/Complete), `PUT /api/admin/reservations/{id}` (edit date/time/guests/note), `DELETE /api/admin/reservations/{id}`, `GET /api/admin/analytics`

**Booking workflow:** every new reservation starts as `PENDING` and blocks that table/date/time for other guests immediately (it is not a "soft hold" — it counts as an active booking for conflict purposes). An admin must explicitly Confirm it from Admin → Reservations before it becomes `CONFIRMED`. Admins can also Cancel, Edit, or permanently Delete any reservation from that same page.

All responses follow the shape:
```json
{ "success": true, "message": "...", "data": { ... }, "timestamp": "..." }
```

---

## 6. Demo Login Credentials

| Role | Email | Password |
|---|---|---|
| Admin | `admin@mahadine.com` | `Admin@12345` |
| User | `user@mahadine.com` | `User@12345` |

These are seeded automatically on first run by `DataInitializer.java` (passwords are BCrypt-hashed before being stored — never in plain text). **These are demo credentials for evaluation only.**

---

## 7. Local Setup

### Prerequisites
- Java 17+ (JDK)
- Maven 3.9+ (or use the included `mvn` if you have it globally)
- MySQL 8+ running locally
- A code editor (VS Code recommended)

### Step 1 — Create the local database
```sql
CREATE DATABASE mahadine;
```
(You do not need to run `schema.sql` — Hibernate creates the tables automatically.)

### Step 2 — Configure local credentials
Open `backend/src/main/resources/application.properties` and confirm/update:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/mahadine?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=root
```
Or instead set environment variables `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` before running — they take priority.

### Step 3 — Build & run the backend
```bash
cd backend
mvn clean install
mvn spring-boot:run
```
On first startup you'll see a console message confirming demo data was seeded.

### Step 4 — Open the app
Because Spring Boot serves the frontend from `src/main/resources/static/`, just open:
```
http://localhost:8080
```
Admin panel: `http://localhost:8080/admin/login.html`

### Editing the frontend
Edit files under `frontend/`, then copy them into the backend's static folder before restarting:
```bash
# from the project root
cp -r frontend/* backend/src/main/resources/static/
```
(If you'd rather develop the frontend with a live-reload dev server on a different port, e.g. `localhost:5500`, that's fine too — `api.js` calls `/api` as a relative path, so you'd just need to run the backend with `CORS_ALLOWED_ORIGINS=http://localhost:5500` set so the browser allows the cross-origin calls.)

---

## 8. Maven Commands Reference

| Command | Purpose |
|---|---|
| `mvn clean install` | Compile, run tests, package into a JAR |
| `mvn spring-boot:run` | Run the app directly (dev mode) |
| `mvn clean package -DskipTests` | Build the JAR without running tests |
| `java -jar target/mahadine-backend.jar` | Run the built JAR directly |

---

## 9. Security Notes

- Passwords are **never** stored in plain text — BCrypt hashing via Spring Security.
- Authentication is stateless JWT; the token is kept in `sessionStorage` on the frontend (cleared when the browser tab closes), never in a hardcoded file or committed anywhere.
- **Every** `/api/admin/**` endpoint requires the `ADMIN` role, enforced in `SecurityConfig.java` on the backend — hiding admin buttons in JavaScript is never treated as real security here.
- Table double-booking is prevented by a **server-side, transactional check** in `ReservationService.reserve()` — the frontend never decides whether a table is available; it only reflects what the backend reports.
- No secrets are committed to GitHub. `.env` is git-ignored; `.env.example` documents which variables to set. Railway secrets are set via **Project Variables**, never in code.

---

## 10. Railway Deployment

**Architecture:** one Railway project containing (1) this Spring Boot app, serving both the API and the static frontend from a single URL, and (2) a Railway-provisioned MySQL database.

### Step 1 — Push to GitHub
```bash
git init
git add .
git commit -m "Initial commit: MAHADINE"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2 — Create the Railway project
1. On [railway.app](https://railway.app), create a **New Project** → **Deploy from GitHub repo** → select this repo.
2. Since the Spring Boot app lives in `backend/`, open the new service's **Settings** and set **Root Directory** to `backend`. Railway will then find `backend/Dockerfile` and build from there.
3. In the same project, click **+ New** → **Database** → **Add MySQL**. Railway automatically creates `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD` variables and can be linked to your app service.

### Step 3 — Set environment variables on the app service
In the app service's **Variables** tab, add:
```
SPRING_PROFILES_ACTIVE=prod
JWT_SECRET=<a long random string>
SEED_ENABLED=true
```
The `MYSQL*` variables are provided automatically by the linked MySQL plugin — you don't set those yourself. `PORT` is also injected automatically by Railway; the app already reads it via `server.port=${PORT:8080}`.

### Step 4 — Deploy
Railway builds the Docker image and deploys automatically on every push to `main`. Once live, open the generated `*.up.railway.app` URL — that's your entire app (frontend + API + admin panel), backed by Railway MySQL.

### Step 5 — Verify
- Visit `/` → home page loads
- Register a new account, browse restaurants, make a booking
- Visit `/admin/login.html` and sign in with the demo admin credentials
- Check `Settings → Deployments → Logs` on Railway if anything looks off

---

## 11. Environment Variables Reference

| Variable | Where | Purpose |
|---|---|---|
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD` | Local | Local MySQL connection |
| `MYSQLHOST`, `MYSQLPORT`, `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD` | Railway | Auto-provided by Railway's MySQL plugin |
| `JWT_SECRET` | Both | Signing key for JWTs — set a long random value in production |
| `JWT_EXPIRATION_MS` | Both | Token lifetime in ms (default 24h) |
| `CORS_ALLOWED_ORIGINS` | Local only (usually) | Comma-separated origins allowed to call the API cross-origin |
| `SEED_ENABLED` | Both | `true`/`false` — whether to seed demo data on first run |
| `SPRING_PROFILES_ACTIVE` | Railway | Set to `prod` to use `application-prod.properties` |
| `PORT` | Railway | Injected automatically; the app reads it via `server.port=${PORT:8080}` |

See `backend/.env.example` for a template (never commit a real `.env` file).

---

## 12. Troubleshooting

- **"Unknown database 'mahadine'"** — create it: `CREATE DATABASE mahadine;`
- **App won't connect to MySQL locally** — double-check `DB_USERNAME` / `DB_PASSWORD`, and that MySQL is running on the expected port.
- **401 on every API call** — your JWT expired or wasn't sent; log in again. Check the browser's Network tab for an `Authorization: Bearer ...` header.
- **403 on admin endpoints** — you're logged in as a `USER`, not an `ADMIN`. Use the admin demo account.
- **"This table has just been booked by another customer"** — expected behavior: the table became unavailable between you loading the page and confirming. Pick another table.
- **CORS errors in local dev** — only happens if you run the frontend on a different port than the backend; set `CORS_ALLOWED_ORIGINS` to include that origin.
- **Railway build fails immediately** — confirm **Root Directory** is set to `backend` in the service settings, so Railway finds `backend/Dockerfile` and `backend/pom.xml`.

---

## 13. Important Note on Demo Data

The restaurants listed (MAHADINE – The Bombay Table, Spice Route Mumbai, Coastal Pearl, Urban Tadka, The Curry House, Mumbai Social Dining, Royal Maharaja, The Garden Bistro, Masala Junction, The Terrace Kitchen) are **sample/demo data** created for this college project. They are not claims about real, currently operating businesses unless independently verified.

---

Built as a full-stack demonstration project — HTML, CSS, JavaScript, Java, Spring Boot, Spring Data JPA, Spring Security, Maven, MySQL, GitHub, Railway.
