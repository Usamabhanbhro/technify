# Technify Website

A full-stack business website for **Technify Software Solutions** – a technology consulting and software development company. The platform showcases the company’s services, portfolio, team, and allows clients to book consultations. It also includes an admin panel for managing bookings.

## 🚀 Live Demo

[Technify Website](https://technify-website.vercel.app/) *(replace with your live URL)*

---

## 📋 Table of Contents

- [About The Project](#-about-the-project)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Environment Variables](#-environment-variables)
- [API Endpoints](#-api-endpoints)
- [Admin Panel](#-admin-panel)
- [Screenshots](#-screenshots)
- [Contributing](#-contributing)
- [License](#-license)
- [Contact](#-contact)

---

## 📖 About The Project

Technify Website is a modern, responsive business website built for a technology consulting and software development company. It presents the company's brand identity, services, portfolio, team, and client testimonials in a professional and engaging manner.

The project was developed as a full-stack application with a React frontend and a Node.js/Express backend, connected to a MongoDB database.

---

## ✨ Features

### Frontend
- **Responsive Design** – Fully responsive across all devices using Tailwind CSS.
- **Modern UI Components** – Built with HeroUI (formerly NextUI) component library.
- **Dynamic Routing** – React Router for seamless page navigation.
- **Consultation Booking** – Interactive booking form with date/time selection.
- **Portfolio Showcase** – Display of projects with filtering and case studies.
- **Services Section** – Comprehensive services listing with detailed descriptions.
- **Team Section** – Leadership team profiles with professional photos.
- **Testimonials** – Client feedback with star ratings.
- **Marquee Animations** – Smooth scrolling logos and process steps.
- **Contact & Social Links** – Integrated social media and contact information.

### Backend
- **RESTful API** – Express.js server with modular route structure.
- **MongoDB Database** – Mongoose ODM for data modeling.
- **Authentication** – JWT-based authentication for admin access.
- **Booking Management** – Consultation booking CRUD operations.
- **Security** – CORS enabled, environment variables for sensitive data.

### Admin Panel
- Secure admin login with JWT authentication.
- View and manage consultation bookings.
- Dashboard with booking statistics.

---

## 🛠 Tech Stack

### Frontend
| Technology | Purpose |
|------------|---------|
| **React.js** | UI library |
| **Vite** | Build tool and dev server |
| **Tailwind CSS** | Utility-first styling framework |
| **HeroUI** | Component library |
| **React Router DOM** | Client-side routing |
| **React Icons** | Icon library |

### Backend
| Technology | Purpose |
|------------|---------|
| **Node.js** | JavaScript runtime |
| **Express.js** | Web framework |
| **MongoDB** | NoSQL database |
| **Mongoose** | ODM for MongoDB |
| **JSON Web Token** | Authentication |
| **CORS** | Cross-origin resource sharing |
| **dotenv** | Environment variable management |

---

## 📁 Project Structure
```
Technify-Website/
├── frontend/ 
│ ├── public/ 
│ ├── src/
│ │ ├── pages/
│ │ │ ├── Home/
│ │ │ ├── AboutUs/
│ │ │ ├── Services/
│ │ │ ├── Portfolio/
│ │ │ ├── ConsultationBooking/
│ │ │ └── AdminPages/
│ │ ├── App.jsx 
│ │ └── main.jsx 
│ ├── index.html
│ ├── package.json
│ └── vite.config.js
│
├── backend/
│ ├── config/ 
│ ├── controllers/ 
│ ├── middlewares/ 
│ ├── models/ 
│ ├── routes/ 
│ ├── services/
│ ├── index.js
│ └── package.json
│
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v16 or higher)
- **npm** or **yarn**
- **MongoDB** (local or cloud instance like MongoDB Atlas)

### Installation

#### 1. Clone the repository

```bash
git clone https://github.com/abdullahshaik697/Technify-Website.git
cd Technify-Website
```

#### 2. Backend Setup

```bash
cd backend
npm install
```
Create a .env file in the backend/ directory (see Environment Variables below).

Start the backend server:

```bash
npm start
```
The server will run on http://localhost:5000 (or the port you specify).

#### 3. Frontend Setup

```bash
cd frontend
npm install
```
Start the development server:

```bash
npm run dev
```

The app will be available at http://localhost:5173 (Vite's default port).

#### 4. Build for Production (Frontend)
```bash
npm run build
npm run preview
```

## 🔐 Environment Variables
Backend (.env)
Create a .env file in the backend/ directory with the following variables:

```env
PORT=
MONGO_URI=
JWT_SECRET=
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

| Variable	| Description |
|-----------|-------------|
|PORT	|Server port (default: 5000)|
|MONGODB_URI |	MongoDB connection string|
|JWT_SECRET |	Secret key for JWT authentication|
|ADMIN_EMAIL|	Email address for sending notifications|
|ADMIN_PASSWORD |	App-specific password for email|
|CLIENT_URL |	Frontend URL for CORS|

## 📄 Pages Breakdown
#### Frontend Pages
| Page	| Route	| Description |
|-------|-------|-------------|
| Home	| /	| The landing page featuring the hero section, stats, services overview, process steps, why choose us, industries, testimonials, and a call-to-action.|
| About Us	| /about | Introduces the company with a “Who We Are” section, mission/vision/values cards, team profiles, and our journey timeline.
| Services |	| /services |	Lists all services offered (Technology Consulting, Custom Software, Mobile App Development, etc.) with a detailed breakdown and a consultation CTA.|
| Portfolio	| /portfolio	| Showcases projects with filtering by category (Web, Mobile, SaaS, etc.), project cards with images, and case study links.|
| Consultation Booking	| /consultation |	A multi‑step booking form where users select a consultation type (Discovery, Strategy, Technical), pick a date/time, and fill in personal details. Includes a confirmation modal and email notification.|
| Contact	| /consultation	| The consultation page serves as the primary contact point.|
| Admin Login	| /admin/login |	Secure login page for administrators.|
| Admin Dashboard	| /admin/dashboard |	Protected admin panel to view all bookings, update statuses, delete entries, and see statistics (total bookings, pending, etc.).|

## 📡 API Endpoints
| Method	| Endpoint |	Description |
|--------|----------|--------------|
|POST |	/api/bookings |	Submit a new consultation booking|
|GET	| /api/bookings |	Get all bookings (admin only)|
|GET	| /api/bookings/:id |	Get a specific booking (admin only)|
|PUT	| /api/bookings/:id	| Update booking status (admin only)|
|DELETE	| /api/bookings/:id |	Delete a booking (admin only)|
|POST	| /api/admin/login |	Admin login (JWT)|
|GET	| /api/admin/verify	| Verify admin token|

## 🔑 Admin Panel
The admin panel is accessible at /admin/login on the frontend.

Default Admin Credentials: (configured via environment variables in backend)

- Email: admin@technify.com (Choose your own)
- Password: admin123 (Choose your own)

After logging in, admins can:

- View all consultation bookings.
- Update booking statuses.
- Delete bookings.
- View dashboard statistics.

## 📄 License
This project is licensed under the ISC License.