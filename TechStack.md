#  MoodFilm – Tech Stack

##  Overview

**MoodFilm** is a web application that recommends movies based on the user's current mood using the **TMDB API**.  
The project integrates real-time APIs, user preference storage, and future **AI emotion detection** capabilities.

---

##  Frontend

| Category | Technology | Description |
|:----------|:------------|:-------------|
| **Framework** | React 18 | Modern component-based UI library |
| **Language** | TypeScript | Static typing and better developer experience |
| **Styling** | Tailwind CSS | Rapid, consistent, utility-first CSS |
| **State Management** | Zustand | Lightweight alternative to Redux |
| **Build Tool** | Vite | Fast dev server and optimized builds |
| **Routing** | React Router DOM | Declarative client-side routing |

---

##  Backend

| Category | Technology | Description |
|:----------|:------------|:-------------|
| **Framework** | Express.js | Minimal, flexible Node.js backend |
| **Language** | Node.js 20 LTS | Stable long-term support version |
| **API Style** | RESTful | Clean and predictable API structure |
| **Authentication** | JWT (with Refresh Tokens) | Stateless and scalable authentication |
| **API Documentation** | Swagger / OpenAPI | Interactive API documentation |

---

##  Database

| Category | Technology | Description |
|:----------|:------------|:-------------|
| **Primary Database** | PostgreSQL 15 | Reliable relational database with JSON support |
| **Caching** | Redis | High-speed caching layer |
| **ORM / Query Builder** | Prisma | Type-safe ORM with migrations and seeding |
| **Session Storage** | Redis | Efficient and scalable session handling |

---

##  Infrastructure

| Category | Technology | Description |
|:----------|:------------|:-------------|
| **Hosting** | Vercel (Frontend) + Railway / Render (Backend) | Fast global CDN for frontend, reliable backend hosting |
| **Containerization** | Docker | Consistent local and production environments |
| **CI/CD** | GitHub Actions | Automated testing and deployment pipelines |
| **Monitoring** | Vercel Analytics + LogRocket | Performance insights and session tracking |
| **Error Tracking** | Sentry | Centralized error reporting and alerts |

---

##  Development Tools

| Category | Technology | Description |
|:----------|:------------|:-------------|
| **Version Control** | Git + GitHub | Collaboration and version tracking |
| **Package Manager** | pnpm | Fast, disk-efficient package manager |
| **Code Quality** | ESLint, Prettier, Husky | Automated formatting and pre-commit checks |
| **Testing** | Jest, React Testing Library, Supertest | Unit, integration, and API testing |
| **API Testing** | Postman / Thunder Client | Manual and automated API verification |

---

##  Third-Party Services

| Category | Service | Purpose |
|:----------|:---------|:----------|
| **Movie Data** | TMDB API | Fetching movie metadata and posters |
| **AI Emotion Detection** | Hugging Face Inference API (Phase 3) | Mood-based text sentiment analysis |
| **Payments** | Stripe | Subscription and premium feature billing |
| **Email** | Resend | Transactional and notification emails |
| **File Storage** | Cloudinary | Hosting user avatars and image assets |
| **Analytics** | Vercel Analytics | Application performance metrics |

---

##  Decision Rationale

###  Frontend Choices
- **React 18 + TypeScript:** Industry-standard combination for scalability and maintainability.  
- **Tailwind CSS:** Enables rapid UI development with consistent design language.  
- **Zustand:** Minimal setup and less boilerplate compared to Redux.  
- **Vite:** Faster build times and superior DX (developer experience) versus Create React App.  

###  Backend Choices
- **Express.js:** Lightweight, unopinionated Node.js framework for flexibility.  
- **Node.js 20 LTS:** Stable runtime supporting modern JavaScript features.  
- **JWT Authentication:** Stateless and scalable, ideal for SPAs and mobile clients.  

###  Database Choices
- **PostgreSQL:** Robust relational database with rich JSON support.  
- **Prisma:** Type-safe, modern ORM simplifying migrations and queries.  
- **Redis:** Used for caching TMDB API responses and managing sessions efficiently.  

###  Infrastructure Choices
- **Vercel:** Optimized for frontend hosting with CDN and instant rollbacks.  
- **Railway / Render:** Simpler backend deployment alternative to AWS.  
- **Docker:** Provides consistent environments across all stages.  

---

##  Alternatives Considered

| Decision Area | Alternative | Chosen | Reason |
|:---------------|:-------------|:--------|:--------|
| **Full Stack Framework** | Next.js | React + Express | Clearer separation for educational and architectural understanding |
| **Database** | MongoDB | PostgreSQL | Structured data and relational queries fit the domain better |
| **State Management** | Redux | Zustand | Simpler, faster, and less verbose |
| **Hosting** | AWS | Vercel | Easier deployment, faster CI/CD, integrated analytics |

---

## Summary

This **tech stack** provides a **robust, scalable, and developer-friendly foundation** for MoodFilm.  
It enables rapid feature development, seamless API integrations, and future expansion toward **AI-driven personalization** and **premium functionality**.

---

