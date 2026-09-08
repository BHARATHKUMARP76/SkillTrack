# SkillTrack — Student Skill Development & Placement Readiness Platform

SkillTrack is a production-grade full-stack MERN (MongoDB, Express.js, React.js, Node.js) platform built to help college students manage technical skill profiles, take domain assessments, track real-world projects and DSA problem-solving, measure placement readiness, match skills against active job requirements, and receive deterministic learning recommendations.

---

## Key Platform Features

### Student Features
- **Student Profile Management**: Manage personal, college, department, graduation year, and career summary details.
- **Technical Skill Tracking**: Set current & target proficiency levels (Beginner, Intermediate, Advanced, Expert) with progress percentage.
- **Skill Assessments**: Take interactive technical assessments with automated backend answer evaluation and topic breakdown (e.g. OOP, Collections, Exception Handling).
- **Project Tracker**: Log real-world software applications with GitHub URL validation and status tracking.
- **DSA Practice Tracker**: Track topic-wise Data Structures & Algorithms problem-solving progress with strict validation ($Solved \le Total$).
- **Placement Readiness Engine**: Dynamically calculates readiness score ($0 - 100\%$) and classifies student into status tiers (*Beginner*, *Developing*, *Almost Ready*, *Placement Ready*, *Highly Ready*).
- **Job Skill Matching Engine**: Compares student skills against job requirements in MongoDB and calculates match percentage.
- **Learning Recommendation Engine**: Algorithmic calculation prioritizing next skills to acquire based on skill gap, market job demand, and assessment weakness.

### Admin Features
- **Admin Dashboard**: System metrics including registered student count, master skills count, assessments count, and active job postings count.
- **Registered Students Manager**: View registered student accounts and registration metadata.
- **Master Skills Manager**: Create, update, and delete system technical skills.
- **Assessment & Question Bank Builder**: Create skill assessments and build question banks with difficulty tiers and topic tagging.
- **Job Posting & Skill Requirements Manager**: Create job opportunities and define required skills with proficiency levels and importance weightage.

---

## Technology Stack

- **Frontend**: React.js (Vite), JavaScript, React Router v6, Axios, Lucide React Icons, Custom Modular CSS Design System.
- **Backend**: Node.js, Express.js, RESTful APIs, JWT Authentication, bcrypt Password Hashing.
- **Database**: MongoDB & Mongoose.
- **Testing**: Jest, Supertest.

---

## Core Algorithms Explained

### 1. Skill Gap Analysis
$$\text{Skill Gap} = \text{Target Progress} - \text{Current Progress}$$
Where Target Progress is mapped from target proficiency level ($Beginner=25\%, Intermediate=50\%, Advanced=75\%, Expert=100\%$).

### 2. Placement Readiness Engine
$$\text{Readiness Score} = (\text{Technical Skills} \times 0.40) + (\text{Assessment Score} \times 0.30) + (\text{Project Score} \times 0.20) + (\text{DSA Score} \times 0.10)$$
- **Technical Skills**: Average progress across all added student skills.
- **Assessment Score**: Average score percentage of all attempted assessments.
- **Project Score**: $0 \text{ projects} = 0, 1 = 40, 2 = 60, 3 = 80, 4+ = 100$.
- **DSA Score**: $(\text{Total Solved Problems} / \text{Total Target Problems}) \times 100$.

### 3. Job Skill Matching Algorithm
$$\text{Match Percentage} = \frac{\text{Matched Required Skills}}{\text{Total Required Skills}} \times 100$$
Evaluates student's skill inventory against all required job skills.

### 4. Learning Recommendation Engine
$$\text{Priority Score} = \text{Skill Gap} \times \text{Job Demand Weight} \times \text{Weakness Factor}$$
- **Job Demand Weight**: $1 + (\text{Count of Active Jobs Requiring Skill} \times 0.5)$.
- **Weakness Factor**: $(100 - \text{Assessment Score}) / 100 + 0.5$ if assessment taken; $1.0$ otherwise.

---

## Folder Structure

```text
SKILL TRACKING/
├── server/
│   ├── config/             # DB configuration (db.js)
│   ├── controllers/        # REST API controllers
│   ├── middleware/         # Auth, Role, Error Handling
│   ├── models/             # Mongoose schemas (11 models)
│   ├── routes/             # Express API routes
│   ├── tests/              # Jest / Supertest integration test suite
│   ├── app.js              # Express app configuration
│   ├── server.js           # Express entry point
│   ├── package.json
│   └── .env
├── client/
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── context/        # Auth Context
│   │   ├── pages/          # Student and Admin pages
│   │   ├── services/       # Axios API client
│   │   ├── App.jsx         # App routing structure
│   │   ├── main.jsx
│   │   └── index.css       # Design tokens & styling
│   ├── vite.config.js
│   └── package.json
├── .env.example
├── .gitignore
└── README.md
```

---

## Installation & Setup

### Prerequisites
- Node.js (v18+)
- MongoDB (running locally on `mongodb://127.0.0.1:27017` or MongoDB Atlas URI)

### 1. Backend Setup
```bash
cd server
npm install
npm start
```
Server runs on `http://localhost:5000`.

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
Client app runs on `http://localhost:3000`.

---

## Running Tests

Execute backend automated test suite:
```bash
cd server
npm test
```

---

## Security Highlights
- Passwords are strictly hashed using bcrypt with salt rounds.
- JWT tokens with 30-day expiration.
- Data Ownership Enforcement: All student endpoints derive identity from `req.user.id` contained in verified JWT payload.
