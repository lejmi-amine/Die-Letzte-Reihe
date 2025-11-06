# 🎬 MoodFilm — Emotion-Based Movie Discovery App

**MoodFilm** is a web application that recommends movies based on the user's **current mood** using the **TMDB API**.  
Instead of genres, it focuses on **emotional discovery**, delivering meaningful, mood-aligned movie suggestions.

---

## 🌈 Project Vision

MoodFilm redefines movie discovery by connecting emotions to storytelling.  
Users express how they _feel_, and the app curates movies that resonate with that emotion — through tone, color, pacing, and theme.

---

## ⚙️ Tech Stack

| Layer                | Technology                                                     |
| -------------------- | -------------------------------------------------------------- |
| **Frontend**         | React 18, TypeScript, Tailwind CSS, Zustand, Vite              |
| **Backend**          | Node.js 20, Express.js, JWT Authentication                     |
| **Database**         | PostgreSQL + Prisma ORM                                        |
| **Caching**          | Redis                                                          |
| **Hosting**          | Vercel (frontend), Railway/Render (backend)                    |
| **APIs & Services**  | TMDB API, Cloudinary, Stripe (premium), Hugging Face (phase 3) |
| **Containerization** | Docker (development setup)                                     |

---

## 🧩 Architecture Overview

MoodFilm follows a **modular full-stack architecture** with clear separation of concerns:

```
moodfilm/
│
├── client/                  # React Frontend (Vite + TS + Tailwind)
│   ├── src/
│   │   ├── components/      # UI components (MoodButtons, MovieCard, etc.)
│   │   ├── pages/           # Page views (Home, Discover, Profile)
│   │   ├── store/           # Zustand global state
│   │   ├── api/             # API service functions (fetchMovies, auth, etc.)
│   │   └── utils/           # Helper functions
│   └── index.html
│
├── server/                  # Express Backend (Node.js + Prisma)
│   ├── src/
│   │   ├── routes/          # Express routes (auth, movies, users)
│   │   ├── controllers/     # Business logic for each route
│   │   ├── prisma/          # Prisma schema & client
│   │   ├── middleware/      # JWT auth, error handling
│   │   ├── services/        # TMDB, Redis, Stripe, etc.
│   │   └── utils/           # Helper functions
│   ├── package.json
│   └── server.ts
│
├── docker-compose.yml       # Optional dev environment
├── .env.example             # Environment variables template
└── README.md
```

---

## 🚀 Phase 1 — MVP Development Roadmap

### 🔧 Step 1: Environment Setup

1. **Install global dependencies**
   ```bash
   npm install -g pnpm
   ```
2. **Set up backend environment**
   ```bash
   cd server
   pnpm install
   pnpm prisma init
   ```
   - Add your `.env` file:
     ```
     DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/moodfilm"
     REDIS_URL="redis://localhost:6379"
     TMDB_API_KEY="YOUR_TMDB_KEY"
     JWT_SECRET="YOUR_SECRET"
     ```
3. **Set up frontend environment**
   ```bash
   cd ../client
   pnpm create vite@latest moodfilm --template react-ts
   pnpm install
   ```
4. **Run both with Docker (optional)**
   ```bash
   docker-compose up
   ```

---

### 🎨 Step 2: Frontend Initialization

**Goal**: Create the mood selection and movie display interface.

1. Set up **Tailwind CSS**
   ```bash
   pnpm install -D tailwindcss postcss autoprefixer
   npx tailwindcss init -p
   ```
2. Create **Mood Selection Component**
   - `src/components/MoodSelector.tsx`
   - Display 6 moods: _Happy, Sad, Stressed, Bored, Romantic, Adventurous_
   - Each mood triggers `fetchMoviesByMood(mood)`
3. Implement **Zustand store**
   - `src/store/moodStore.ts`
   - Holds current mood, fetched movies, and loading state
4. Create **MovieGrid Component**
   - Displays results from TMDB in responsive grid layout
5. Build **Responsive Layout**
   - Use Tailwind Flex/Grid
   - Dark/light mode support

---

### ⚡ Step 3: Backend Initialization

**Goal**: Build TMDB route and mood mapping logic.

1. Create `/routes/movies.ts`
2. Add controller: `getMoviesByMood(mood: string)`
   - Maps mood → TMDB genres/keywords
   - Fetches from TMDB API
   - Returns filtered results to frontend
3. Integrate **Prisma** & PostgreSQL
   - Define schema for `User`, `Favorite`, `MoodHistory`
   - Run:
     ```bash
     pnpm prisma migrate dev --name init
     ```
4. Test endpoint locally:
   ```
   GET http://localhost:5000/api/movies?mood=happy
   ```

---

### 🧠 Step 4: Core Algorithm Implementation

- Build a **mood-to-genre mapping** (e.g., via JSON or Prisma table):
  ```json
  {
    "happy": ["35", "10751"],
    "sad": ["18", "10749"],
    "stressed": ["16", "99"]
  }
  ```
- Adjust the TMDB query builder dynamically based on the mood profile.
- Later phases will use Hugging Face emotion detection (Phase 3).

---

### 🔐 Step 5: Authentication (Phase 1.5)

- Add JWT-based auth routes:
  - `/auth/register`, `/auth/login`, `/auth/me`
- Protect endpoints for user favorites
- Store refresh tokens securely with Redis

---

### 💾 Step 6: Database Entities (Prisma)

```prisma
model User {
  id         Int       @id @default(autoincrement())
  email      String    @unique
  password   String
  favorites  Favorite[]
  createdAt  DateTime  @default(now())
}

model Favorite {
  id        Int      @id @default(autoincrement())
  movieId   String
  userId    Int
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## 🧱 Folder-by-Folder Development Order

| Order | Folder                                   | Focus                 |
| ----- | ---------------------------------------- | --------------------- |
| 1️⃣    | `server/src/prisma`                      | Database schema setup |
| 2️⃣    | `server/src/routes/movies.ts`            | Core TMDB API         |
| 3️⃣    | `client/src/components/MoodSelector.tsx` | UI entry point        |
| 4️⃣    | `client/src/store/moodStore.ts`          | Global state          |
| 5️⃣    | `client/src/components/MovieGrid.tsx`    | Movie display         |
| 6️⃣    | `server/src/routes/auth.ts`              | JWT Auth (optional)   |

---

## 🗓 Roadmap

| Phase     | Focus                                   | Status         |
| --------- | --------------------------------------- | -------------- |
| Phase 1   | MVP (Mood → Movies + TMDB Integration)  | 🚧 In Progress |
| Phase 1.5 | Authentication + Favorites              | ⏳ Upcoming    |
| Phase 2   | Stripe Premium & Cloudinary Integration | 🔜 Planned     |
| Phase 3   | AI Emotion Detection via Hugging Face   | 🔜 Planned     |
| Phase 4   | Family Mode & Final Polish              | 🔜 Planned     |

---

## 🧠 Future Enhancements

- Emotion-based background music or visuals
- ChatGPT-powered conversational mood input
- Collaborative watchlists

---

## 🧰 Development Commands

| Command              | Description                                        |
| -------------------- | -------------------------------------------------- |
| `pnpm dev`           | Run development mode (frontend/backend separately) |
| `pnpm prisma studio` | Open Prisma database GUI                           |
| `pnpm build`         | Build for production                               |
| `docker-compose up`  | Launch all services locally                        |
| `vercel --prod`      | Deploy frontend                                    |
| `railway up`         | Deploy backend                                     |

---

## 👥 Team & Attribution

- **Project Lead & Developer:** Amine Lejmi
- **APIs:** [TMDB](https://www.themoviedb.org/documentation/api)
- **UI/UX:** Custom design system inspired by mood-based aesthetics

---

## 📜 License

MIT License © 2025 Amine Lejmi
