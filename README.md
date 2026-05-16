# 📚 GATE Prep Hub

A **Progressive Web App (PWA)** for GATE CS exam preparation — 49 subject-wise PDF notes with authentication, bookmarks, annotations, progress tracking, and a full admin panel.

---

## 3-Tier Application Architecture

```mermaid
graph TB
  subgraph TIER1["Tier 1 — Client (Browser / PWA)"]
    HTML["index.html<br/>App Shell + Modals"]
    CSS["styles.css<br/>Dark Theme UI"]
    SW["sw.js<br/>Service Worker<br/>(Cache-first / Network-first)"]
    APP["app.js<br/>Main Controller"]
    AUTH["auth.js<br/>Auth Modal & Session"]
    ADMIN["admin.js<br/>Admin Panel"]
    SEARCH["search.js<br/>Trigram Fuzzy Search"]
    ANALYTICS["analytics.js<br/>GA4 + Local Event Log"]
    LS["localStorage<br/>Favorites · Bookmarks<br/>Annotations · Progress"]
  end

  subgraph TIER2["Tier 2 — Application / API Layer"]
    SB_AUTH["Supabase Auth<br/>JWT Sessions"]
    SB_DB["Supabase Database<br/>PostgreSQL + RLS"]
    SB_RT["Supabase Realtime<br/>(onAuthStateChange)"]
    VERCEL["Vercel Edge<br/>Static Hosting + Headers"]
  end

  subgraph TIER3["Tier 3 — Storage / External Services"]
    GDRIVE["Google Drive<br/>PDF Files (49 notes)"]
    GA4["Google Analytics 4<br/>Usage Telemetry"]
    PG["PostgreSQL<br/>profiles · login_logs<br/>pdf_views"]
  end

  HTML --> APP
  HTML --> AUTH
  HTML --> ADMIN
  APP --> SEARCH
  APP --> ANALYTICS
  APP --> LS
  AUTH --> SB_AUTH
  AUTH --> SB_DB
  APP --> SB_DB
  ADMIN --> SB_DB
  SB_AUTH --> SB_RT
  SB_RT --> AUTH
  SB_DB --> PG
  APP --> GDRIVE
  ANALYTICS --> GA4
  VERCEL --> HTML
  SW --> LS
```

---

## File Structure

```
gate prep book/
├── index.html          — App shell, all screens & modals
├── styles.css          — Complete dark-theme CSS
├── app.js              — Main controller (subjects, PDF viewer, screens)
├── auth.js             — Authentication (sign-in, sign-up, session, ban check)
├── admin.js            — Admin panel (user management, logs, visibility)
├── search.js           — Trigram fuzzy search engine
├── analytics.js        — GA4 wrapper + local event log
├── supabase.js         — Supabase client singleton
├── sw.js               — Service Worker (offline PWA support)
├── config.js           — Auto-generated env vars (do not commit)
├── generate-config.js  — Generates config.js from .env (Node.js)
├── generate-config.sh  — Same for Mac/Linux shell
├── schema.sql          — Full Supabase database schema
├── manifest.json       — PWA manifest (icons, shortcuts, display)
├── vercel.json         — Vercel deployment config (headers, build)
├── upload-pdfs.js      — Utility: bulk upload PDFs to storage
└── gate book - Copy/   — Local PDF files (12 subject folders, 49 files)
```

---

## Database Schema

```mermaid
erDiagram
  AUTH_USERS {
    uuid   id PK
    text   email
    jsonb  raw_user_meta_data
    timestamptz created_at
  }

  PROFILES {
    uuid    id PK,FK
    text    name
    text    email
    boolean is_pro
    boolean is_admin
    boolean is_banned
    timestamptz created_at
    timestamptz updated_at
  }

  LOGIN_LOGS {
    uuid  id PK
    uuid  user_id FK
    text  email
    text  name
    text  user_agent
    timestamptz logged_in_at
  }

  PDF_VIEWS {
    uuid  id PK
    uuid  user_id FK
    text  email
    text  pdf_id
    text  pdf_name
    text  subject
    timestamptz viewed_at
  }

  AUTH_USERS ||--|| PROFILES    : "trigger on signup"
  PROFILES   ||--o{ LOGIN_LOGS  : "has many"
  PROFILES   ||--o{ PDF_VIEWS   : "has many"
```

---

## Authentication Flow

```mermaid
sequenceDiagram
  actor User
  participant Modal as Auth Modal (auth.js)
  participant Supabase as Supabase Auth
  participant DB as profiles table
  participant App as app.js

  User->>Modal: Click "Sign In" button
  Modal->>Supabase: signInWithPassword(email, password)
  Supabase-->>Modal: JWT session + user object

  Modal->>DB: SELECT is_banned WHERE id = user.id
  alt User is banned
    DB-->>Modal: is_banned = true
    Modal->>Supabase: signOut()
    Modal-->>User: ❌ "Account suspended"
  else User is active
    DB-->>Modal: is_banned = false
    Modal->>DB: INSERT login_logs (email, name, user_agent)
    Modal->>App: window.onAuthStateChange(user)
    App-->>User: ✅ Show avatar + unlock PDF access
  end
```

---

## Data Flow — Where Data Lives

```mermaid
flowchart LR
  subgraph USER_ACTIONS["User Actions"]
    A1["Open PDF"]
    A2["Add Favorite ❤"]
    A3["Bookmark Page 🔖"]
    A4["Write Annotation 📝"]
    A5["Sign In / Out"]
    A6["Admin Edit User"]
  end

  subgraph LOCAL["Browser — localStorage"]
    L1["gh_favorites"]
    L2["gh_bookmarks"]
    L3["gh_annotations"]
    L4["gh_viewed"]
    L5["gh_event_log (last 200)"]
    L6["gh_admin_hidden / custom"]
  end

  subgraph SUPABASE["Supabase — PostgreSQL"]
    S1["profiles"]
    S2["login_logs"]
    S3["pdf_views"]
  end

  subgraph GDRIVE["Google Drive"]
    G1["PDF Files (49)"]
    G2["Embedded via iframe"]
  end

  A1 --> L4
  A1 --> S3
  A1 --> G2
  A2 --> L1
  A3 --> L2
  A4 --> L3
  A5 --> S1
  A5 --> S2
  A6 --> S1
  A1 -.->|analytics| L5
```

---

## Module Dependency Map

```mermaid
graph LR
  CONFIG["config.js<br/>(window.ENV)"]
  SBJS["supabase.js<br/>(window.supabase)"]
  ANALYTICS["analytics.js<br/>(window.Analytics)"]
  SEARCH["search.js<br/>(window.FuzzySearch)"]
  AUTH["auth.js<br/>(window.Auth)"]
  ADMIN["admin.js<br/>(window.Admin)"]
  APP["app.js<br/>(window.App)"]

  CONFIG --> SBJS
  SBJS --> AUTH
  SBJS --> ADMIN
  SBJS --> APP
  AUTH --> APP
  ANALYTICS --> APP
  ANALYTICS --> AUTH
  ANALYTICS --> ADMIN
  SEARCH --> APP
  AUTH --> ADMIN
  APP --> ADMIN
```

> **Load order in index.html:** `config.js` → `supabase CDN` → `supabase.js` → `analytics.js` → `search.js` → `auth.js` → `admin.js` → `app.js`

---

## Service Worker Caching Strategy

```mermaid
flowchart TD
  REQ["Browser Request"]
  REQ --> CHECK{Request type?}

  CHECK -->|"Static asset\n(HTML/CSS/JS)"| CF["Cache-First"]
  CHECK -->|"PDF file\n(.pdf)"| NF["Network-First"]
  CHECK -->|"External URL\n(Drive/Analytics)"| SKIP["Pass through\n(no SW intercept)"]

  CF --> CACHE_HIT{In cache?}
  CACHE_HIT -->|Yes| SERVE_CACHE["Serve from cache ⚡"]
  CACHE_HIT -->|No| FETCH1["Fetch from network"]
  FETCH1 --> STORE1["Store in gh-static-v1"]
  FETCH1 -->|Offline| FALLBACK["Serve index.html fallback"]

  NF --> FETCH2["Fetch from network"]
  FETCH2 -->|Success + size < 50MB| STORE2["Store in gh-pdfs-v1"]
  FETCH2 -->|Offline| PDF_CACHE_HIT{In PDF cache?}
  PDF_CACHE_HIT -->|Yes| SERVE_PDF["Serve cached PDF"]
  PDF_CACHE_HIT -->|No| ERR["503 — PDF unavailable offline"]
```

---

## Screen & Navigation Map

```mermaid
stateDiagram-v2
  [*] --> Welcome : App loads

  Welcome --> Viewer      : Click subject card or PDF item
  Welcome --> Favorites   : Click ❤ Favorites button
  Welcome --> Bookmarks   : Click 🔖 Bookmarks button
  Welcome --> Profile     : Avatar → My Profile

  Viewer --> Welcome      : Close viewer (← Back)
  Favorites --> Viewer    : Click favorite card
  Bookmarks --> Viewer    : Click bookmark card
  Profile --> Welcome     : Click subject / navigate away

  Viewer --> AuthModal    : Not signed in — auto-prompt
  AuthModal --> Viewer    : Login success
  AuthModal --> Welcome   : Close modal

  Welcome --> AdminPanel  : Avatar → Admin Panel (admin only)
  AdminPanel --> Welcome  : ← Back to Hub
```

---

## Admin Panel Capabilities

```mermaid
mindmap
  root((Admin Panel))
    Overview
      Total Users
      Total Logins
      Total PDF Views
      Banned Users count
    Users Table
      View all registered users
      Edit name / Pro / Admin / Banned
      Ban :: Unban instantly
      Delete profile
    Login History
      Email
      Name
      Timestamp
      Browser / Device
    PDF View Log
      Email
      Note name
      Subject
      Timestamp
    Top 5 Notes
      By view count
    Subject Visibility
      Show :: Hide subjects
    Custom Notes
      Add local PDF entry
      Remove custom entry
```

---

## Deployment Architecture

```mermaid
graph TB
  subgraph DEV["Local Development"]
    LIVESERVER["VS Code Live Server\nlocalhost:5500"]
    ENV_FILE[".env file\n(SUPABASE_URL, ANON_KEY)"]
    GENSCRIPT["generate-config.sh\nor node generate-config.js"]
    ENV_FILE --> GENSCRIPT --> CONFIG_JS["config.js\n(window.ENV)"]
    CONFIG_JS --> LIVESERVER
  end

  subgraph PROD["Production — Vercel"]
    VERCEL_EDGE["Vercel Edge Network\nStatic Hosting"]
    BUILD["Build Command:\nnode generate-config.js"]
    ENV_VARS["Vercel Environment Variables\n(SUPABASE_URL, ANON_KEY)"]
    ENV_VARS --> BUILD --> VERCEL_EDGE
    VERCEL_EDGE -->|"Security headers\nX-Frame-Options\nReferrer-Policy"| BROWSER
  end

  subgraph BACKEND["Backend — Supabase (always on)"]
    SB["Supabase Project\nytjkeafdqftjciprioon"]
    PG2["PostgreSQL\nprofiles · login_logs · pdf_views"]
    RLS["Row Level Security\nUsers see own data\nAdmins see all"]
    SB --> PG2
    PG2 --> RLS
  end

  BROWSER["User Browser / PWA"]
  GDRIVE2["Google Drive\n49 PDF Notes"]

  LIVESERVER --> BROWSER
  VERCEL_EDGE --> BROWSER
  BROWSER <--> SB
  BROWSER --> GDRIVE2
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Vanilla JS (ES2020), HTML5, CSS3 — zero frameworks |
| **Auth** | Supabase Auth v2 (email + password, JWT sessions) |
| **Database** | Supabase PostgreSQL with Row Level Security |
| **PDF Storage** | Google Drive (embedded via iframe, download via export URL) |
| **Search** | Custom trigram fuzzy search (Jaccard similarity) |
| **Analytics** | Google Analytics 4 + localStorage event log |
| **Offline** | Service Worker PWA (Cache-first static, Network-first PDFs) |
| **Deployment** | Vercel (static, edge headers, build command) |
| **Styling** | CSS custom properties, dark theme, responsive grid |

---

## Subjects Covered (12 subjects, 49 notes)

| # | Subject | Notes |
|---|---|---|
| 1 | C & Data Structures | 5 |
| 2 | Algorithms | 4 |
| 3 | Theory of Computation | 5 |
| 4 | Compiler Design | 4 |
| 5 | Operating Systems | 5 |
| 6 | DBMS | 4 |
| 7 | Computer Organization & Architecture | 6 |
| 8 | Digital Logic | 6 |
| 9 | Computer Networks | 4 |
| 10 | Discrete Mathematics | 4 |
| 11 | Engineering Mathematics | 2 |
| 12 | General Ability | 5 |

---

## Local Setup

```bash
# 1. Clone / open the project folder

# 2. Create .env file
echo "SUPABASE_URL=https://your-project.supabase.co" >> .env
echo "SUPABASE_ANON_KEY=your-anon-key" >> .env

# 3. Generate config.js
node generate-config.js
# or on Mac/Linux:
./generate-config.sh

# 4. Serve with Live Server (VS Code extension) or any static server
npx serve .
```

---

## Supabase Setup

Run [schema.sql](schema.sql) in **Supabase Dashboard → SQL Editor**, then grant admin:

```sql
-- Sync existing users into profiles
insert into public.profiles (id, name, email, is_pro, is_admin)
select id, raw_user_meta_data->>'name', email, false, false
from auth.users
on conflict (id) do nothing;

-- Grant admin access
update public.profiles set is_admin = true
where id = (select id from auth.users where lower(email) = 'your@email.com');

update auth.users
set raw_user_meta_data = raw_user_meta_data || '{"is_admin":true}'::jsonb
where lower(email) = 'your@email.com';
```

Sign out and sign in again — the **🔧 Admin Panel** button will appear in the avatar dropdown.
