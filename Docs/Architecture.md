# Software Architecture – MoodFilm

## 1. Introduction

**MoodFilm** is a modern full-stack web application built with **Next.js**, featuring a modular, component-based architecture optimized for rapid feature development and excellent user experience.

**Architectural Goal:** Clean separation of concerns, type-safe development, and a scalable foundation for premium features.

---

## 2. Architectural Overview

### 2.1 Full-Stack Monolith with Modular Design

- **Single Codebase:** Next.js app combining frontend and API routes  
- **Modular Components:** Feature-based folder structure  
- **Type Safety:** End-to-end TypeScript  
- **API Layer:** Serverless functions for backend logic  

### 2.2 Layered Architecture

| Layer | Responsibilities | Technologies |
|:------|:------------------|:--------------|
| **Presentation** | UI Components, Animations, Responsive Design | React, Tailwind, Framer Motion |
| **Application** | Business Logic, State Management, Routing | Next.js, Zustand, React Router |
| **API** | TMDB Integration, AI Processing, Authentication | Next.js API Routes, NextAuth |
| **Data** | User Data, Caching, Sessions | PostgreSQL, Redis, Prisma |
| **Infrastructure** | Deployment, Monitoring, CI/CD | Vercel, GitHub Actions |

---

## 3. Core Components & Modules

### 3.1 Mood Selection Module
- **Component:** `MoodSelector.tsx`  
- **State:** Selected mood, mood categories  
- **API:** Mood-to-genre mapping logic  
- **Signals:** `onMoodSelect`, `onMoodChange`

### 3.2 Movie Recommendation Engine
- **Component:** `MovieGrid.tsx`  
- **Service:** `tmdbService.ts` (API abstraction)  
- **Logic:** Mood filtering, scoring algorithm  
- **State:** Movies list, loading states, filters  

### 3.3 User Management Module
- **Components:** `AuthForm.tsx`, `UserProfile.tsx`  
- **Service:** `authService.ts` (NextAuth integration)  
- **State:** User session, preferences, favorites  

### 3.4 Premium Features Module
- **Components:** `PremiumThemes.tsx`, `SubscriptionModal.tsx`  
- **Service:** `premiumService.ts` (Stripe integration)  
- **Logic:** Feature gating, theme management  

### 3.5 AI Emotion Detection (Phase 3)
- **Component:** `EmotionInput.tsx`  
- **Service:** `aiService.ts` (Hugging Face integration)  
- **Logic:** Text sentiment analysis, mood mapping  

---

## 4. Data Flow & State Management

### 4.1 Client-Side State (Zustand)

```typescript
// Stores
useMoodStore     // Current mood, mood history
useMovieStore    // Movies, filters, loading states
useUserStore     // User data, preferences, favorites
usePremiumStore  // Subscription status, active themes
```

### 4.2 Server-Side Data Flow

1. User selects a mood → mapped to TMDB genres  
2. API call to TMDB with mood filters  
3. Response processed via scoring algorithm  
4. Movies displayed with mood relevance indicators  

### 4.3 Authentication Flow

- **Framework:** NextAuth.js with JWT sessions  
- **Security:** Protected API routes for premium features  
- **Rendering:** Server-side props for user-specific content  

---

## 5. Tech Stack Alignment

| Concern | Tech Choice | Rationale |
|:---------|:-------------|:-----------|
| **Full-Stack Framework** | Next.js 14 | SSR/SSG, API routes, seamless Vercel integration |
| **Type Safety** | TypeScript | Early error detection, strong developer experience |
| **Styling** | Tailwind CSS | Rapid UI development, consistent design system |
| **State Management** | Zustand | Lightweight, fast, less boilerplate than Redux |
| **Database** | PostgreSQL + Prisma | Type-safe queries, migrations, Vercel integration |
| **Deployment** | Vercel | Optimized for Next.js, automatic deployments |
| **Payments** | Stripe | Robust subscription management |
| **AI Integration** | Hugging Face | State-of-the-art models without infrastructure overhead |

---

## 6. Folder Structure

```text
moodfilm/
├── app/                    # Next.js 14 app router
│   ├── (auth)/             # Authentication routes
│   ├── api/                # API routes
│   │   ├── auth/           # NextAuth endpoints
│   │   ├── movies/         # TMDB proxy endpoints
│   │   └── premium/        # Stripe webhooks
│   ├── moods/              # Mood selection page
│   └── profile/            # User profile
├── components/
│   ├── ui/                 # Reusable UI components
│   ├── moods/              # Mood-specific components
│   ├── movies/             # Movie display components
│   └── premium/            # Premium feature components
├── lib/                    # Utilities and configurations
│   ├── auth.ts             # NextAuth config
│   ├── db.ts               # Prisma client
│   └── tmdb.ts             # TMDB API client
├── stores/                 # Zustand state stores
├── types/                  # TypeScript definitions
└── public/                 # Static assets
```

---

## 7. Non-Functional Requirements

| Requirement | Architectural Approach |
|:-------------|:-----------------------|
| **Performance** | Next.js SSR/SSG, Redis caching, CDN for assets |
| **Scalability** | Serverless API routes, connection pooling |
| **Maintainability** | Feature-based structure, TypeScript, clear interfaces |
| **Security** | NextAuth, protected API routes, environment variables |
| **User Experience** | Instant mood switching, optimistic UI, smooth animations |

---

## 8. Architecture Decision Records (ADRs)

### ADR-001 – Next.js over Separate Frontend/Backend
- **Status:** Accepted  
- **Context:** Need for rapid development and deployment  
- **Decision:** Use Next.js full-stack framework  
- **Rationale:** Faster development, better performance, simpler deployment  
- **Consequences:** Monolithic codebase; modular structure mitigates coupling  

### ADR-002 – Zustand over Redux
- **Status:** Accepted  
- **Context:** Complex client-side state (moods, movies, user data)  
- **Decision:** Use Zustand for state management  
- **Rationale:** Less boilerplate, faster learning curve, strong TypeScript support  
- **Consequences:** Smaller ecosystem than Redux, but sufficient for project needs  

### ADR-003 – Vercel Platform
- **Status:** Accepted  
- **Context:** Need for seamless deployment and scaling  
- **Decision:** Use Vercel ecosystem (Postgres, KV, Blob)  
- **Rationale:** Optimized for Next.js, excellent developer experience  
- **Consequences:** Platform lock-in, offset by development speed benefits  

---

## 9. Phase Implementation Strategy

| Phase | Focus | Key Deliverables |
|:------|:-------|:-----------------|
| **Phase 1 – Core MVP** | Next.js setup, basic TMDB integration | TypeScript setup, mood selection, movie grid, Vercel deployment |
| **Phase 2 – User Features** | Authentication & personalization | NextAuth, favorites system, family filters, Stripe foundation |
| **Phase 3 – AI & Premium** | Intelligent & paid features | Hugging Face sentiment, premium themes, analytics, mobile optimization |

---

## 10. Summary

MoodFilm adopts a **modern, full-stack TypeScript architecture** centered on **Next.js** for both front- and back-end logic.  
The **modular component structure** enables rapid feature development and maintainability, while **Vercel’s ecosystem** ensures seamless deployment and scalability.

---
