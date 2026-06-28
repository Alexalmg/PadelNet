# PadelNet — Documentación Completa del Proyecto

> Documento destinado a una IA o desarrollador que recibe el proyecto desde cero.  
> Cubre arquitectura, stack, base de datos, backend, frontend, flujos y estado actual.

---

## Índice

1. [Visión general](#1-visión-general)
2. [Stack tecnológico](#2-stack-tecnológico)
3. [Estructura de carpetas](#3-estructura-de-carpetas)
4. [Cómo arrancar el proyecto](#4-cómo-arrancar-el-proyecto)
5. [Variables de entorno](#5-variables-de-entorno)
6. [Base de datos](#6-base-de-datos)
7. [Backend — Arquitectura](#7-backend--arquitectura)
8. [API REST — Endpoints](#8-api-rest--endpoints)
9. [Sistema de autenticación JWT](#9-sistema-de-autenticación-jwt)
10. [Sistema de penalizaciones y actividad semanal](#10-sistema-de-penalizaciones-y-actividad-semanal)
11. [Frontend Web (NUEVO FRONTEND)](#11-frontend-web-nuevo-frontend)
12. [Frontend Flutter](#12-frontend-flutter)
13. [Estado actual y TODOs](#13-estado-actual-y-todos)

---

## 1. Visión general

**PadelNet** es una plataforma de gestión de ligas de pádel. Permite:

- Registrar y gestionar **jugadores**, **equipos**, **ligas**, **divisiones**, **temporadas** y **partidos**.
- Los partidos tienen dos confirmaciones: el equipo local y el visitante confirman el resultado.
- Hay un **sistema automático de penalizaciones**: si un equipo no juega ningún partido en una semana, recibe una penalización automática de puntos. Si acumula demasiadas infracciones, se puede descender o expulsar.
- Hay roles de usuario: **jugador** (`player`), **capitán** (`captain`) y **administrador** (`admin`).

El proyecto tiene tres partes:

| Parte | Tecnología | Puerto | Estado |
|-------|-----------|--------|--------|
| Backend API | Node.js + TypeScript + Express + Sequelize | 3000 | ✅ Auth completa, resto esqueleto |
| Frontend Web | React (JSX inline con Babel) | 8080 | ✅ UI completa con datos mock, conectada a API auth real |
| Frontend Mobile | Flutter (Dart) | N/A | ⚙️ Estructura lista, pantallas stub |

---

## 2. Stack tecnológico

### Backend
| Tecnología | Versión | Uso |
|-----------|---------|-----|
| Node.js | ≥18 | Runtime |
| TypeScript | ^5.3 | Lenguaje |
| Express | ^4.18 | Framework HTTP |
| Sequelize | ^6.35 | ORM |
| PostgreSQL | 15 | Base de datos relacional |
| jsonwebtoken | ^9.0 | Tokens JWT (access + refresh) |
| bcryptjs | ^2.4 | Hash de contraseñas |
| express-validator | ^7.0 | Validación de inputs |
| helmet | ^7.1 | Cabeceras de seguridad HTTP |
| express-rate-limit | ^7.1 | Rate limiting (100 req / 15 min por IP en `/api/`) |
| node-cron | ^3.0 | Jobs programados (verificación semanal de actividad) |
| firebase-admin | ^12.0 | Push notifications (configurado, no activo) |
| ts-node-dev | ^2.0 | Dev server con hot-reload |

### Frontend Web
| Tecnología | Uso |
|-----------|-----|
| React 18 (UMD) | UI declarativa |
| Babel Standalone | Transpila JSX en el navegador (desarrollo) |
| CSS custom properties | Sistema de temas (dark/light) |
| Fetch API | Llamadas al backend |
| localStorage | Persistencia de tokens JWT |

### Frontend Mobile
| Tecnología | Uso |
|-----------|-----|
| Flutter / Dart | Cross-platform (Android, iOS, Web) |
| flutter_riverpod | State management |
| go_router | Navegación |
| dio + retrofit | HTTP client + generación de cliente API |
| flutter_secure_storage | Almacenamiento seguro de tokens |
| firebase_messaging | Push notifications |

### Infraestructura (desarrollo)
- **PostgreSQL**: Corre en Docker (`postgres:15-alpine`)
- **Backend**: `ts-node-dev` con hot-reload
- **Frontend Web**: `python3 -m http.server 8080`

---

## 3. Estructura de carpetas

```
padelnet-mobile/
│
├── backend/                        # API REST Node.js + TypeScript
│   ├── src/
│   │   ├── app.ts                  # Entry point: Express app, middlewares, rutas, arranque del servidor
│   │   ├── config/
│   │   │   ├── database.ts         # Conexión Sequelize a PostgreSQL
│   │   │   ├── jwt.ts              # Secretos y tiempos de expiración JWT
│   │   │   └── firebase.ts         # Init Firebase Admin SDK
│   │   ├── controllers/
│   │   │   └── auth.controller.ts  # Manejadores HTTP para auth (register, login, refresh, profile)
│   │   ├── routes/
│   │   │   ├── auth.routes.ts      # POST /api/auth/register|login|refresh, GET /api/auth/profile
│   │   │   ├── users.routes.ts     # GET /api/users, GET /api/users/:id (TODO)
│   │   │   ├── teams.routes.ts     # CRUD /api/teams (TODO)
│   │   │   ├── leagues.routes.ts   # CRUD /api/leagues (TODO)
│   │   │   └── matches.routes.ts   # GET/POST /api/matches (TODO)
│   │   ├── services/
│   │   │   ├── auth.service.ts     # Lógica de registro, login, refresh token
│   │   │   ├── activity.service.ts # Verificación semanal de actividad por equipo
│   │   │   └── penalty.service.ts  # Aplicar / listar / eliminar penalizaciones
│   │   ├── models/
│   │   │   ├── index.ts            # Exporta todos los modelos y el enum UserRole
│   │   │   ├── user.model.ts
│   │   │   ├── team.model.ts
│   │   │   ├── league.model.ts
│   │   │   ├── division.model.ts
│   │   │   ├── season.model.ts
│   │   │   ├── match.model.ts
│   │   │   ├── match-result.model.ts
│   │   │   ├── lineup.model.ts
│   │   │   ├── team-player.model.ts
│   │   │   ├── penalty.model.ts
│   │   │   └── activity-log.model.ts
│   │   ├── middleware/
│   │   │   └── auth.middleware.ts  # authenticateToken, requireRole
│   │   ├── jobs/
│   │   │   └── activity-check.job.ts  # Cron semanal (domingos 00:00)
│   │   └── utils/                  # (vacío — reservado para helpers futuros)
│   ├── .env                        # Variables de entorno (no commitear)
│   ├── env.example                 # Plantilla de variables de entorno
│   ├── package.json
│   └── tsconfig.json
│
├── NUEVO FRONTEND/                 # Frontend web React (sin bundler)
│   ├── PadelNet Web.html           # Entry point — carga todos los JSX
│   ├── PadelNet.html               # Variante alternativa (móvil)
│   ├── data.jsx                    # Datos mock (equipos, partidos, jugadores, clasificación)
│   ├── api.jsx                     # Cliente API real (fetch al backend en localhost:3000)
│   ├── ui.jsx                      # Componentes UI reutilizables (botones, cards, iconos, modal)
│   ├── tweaks-panel.jsx            # Panel lateral de ajustes de UI (temas, colores)
│   ├── screen-login.jsx            # Pantalla de login / registro
│   ├── desk-shell.jsx              # Shell de la app desktop (sidebar + topbar + router de vistas)
│   ├── desk-dashboard.jsx          # Dashboard principal
│   ├── desk-leagues.jsx            # Vista de ligas y clasificación
│   ├── desk-matches.jsx            # Vista de partidos
│   ├── desk-teams.jsx              # Vista de equipos y plantilla
│   ├── desk-profile.jsx            # Vista de perfil de usuario
│   └── desk-app.jsx                # Root de la app: decide login vs app principal
│
├── frontend/                       # App Flutter (mobile + web)
│   ├── lib/
│   │   ├── main.dart
│   │   ├── core/
│   │   │   ├── config/app_config.dart    # URL base de la API
│   │   │   ├── constants/
│   │   │   └── routes/app_router.dart    # GoRouter
│   │   ├── data/
│   │   │   ├── api/api_client.dart       # Dio + interceptores JWT
│   │   │   ├── models/                   # DTOs con json_serializable
│   │   │   └── repositories/
│   │   ├── domain/
│   │   │   ├── entities/
│   │   │   └── usecases/
│   │   └── presentation/
│   │       ├── screens/                  # login, register, home, leagues, teams, matches
│   │       ├── widgets/
│   │       └── providers/               # Riverpod providers
│   └── pubspec.yaml
│
├── database/
│   └── migrations/
│       └── 001_initial_schema.sql       # Schema completo con triggers de updatedAt
│
└── docs/
    ├── api.md
    ├── architecture.md
    └── database-schema.md
```

---

## 4. Cómo arrancar el proyecto

### Requisitos previos
- **Docker** (para PostgreSQL)
- **Node.js** ≥ 18 y **npm**
- **Python 3** (para servir el frontend, o cualquier servidor HTTP estático)

### Paso 1 — PostgreSQL con Docker

```bash
docker run -d \
  --name padelnet-postgres \
  -e POSTGRES_USER=padelnet_user \
  -e POSTGRES_PASSWORD=padelnet \
  -e POSTGRES_DB=padelnet \
  -p 5432:5432 \
  postgres:15-alpine
```

Espera ~3 segundos y verifica que está listo:

```bash
docker exec padelnet-postgres pg_isready -U padelnet_user -d padelnet
```

### Paso 2 — Migración de la base de datos

```bash
docker exec -i padelnet-postgres psql -U padelnet_user -d padelnet \
  < database/migrations/001_initial_schema.sql
```

Esto crea todas las tablas con sus índices y triggers automáticos de `updated_at`.

### Paso 3 — Backend

```bash
cd backend

# Si es la primera vez, dar permisos a los binarios
find node_modules/.bin -type f | xargs chmod +x

# Arrancar en modo desarrollo (hot-reload)
npm run dev
```

El servidor arranca en `http://localhost:3000`.  
Comprueba el health: `GET http://localhost:3000/health` → `{ "status": "ok" }`

> **IMPORTANTE**: El `app.ts` usa `sequelize.sync()` (sin `alter: true`) porque el schema ya fue creado con la migración SQL. No cambies eso a `alter: true` — conflictos de tipo ENUM con VARCHAR.

### Paso 4 — Frontend Web

```bash
cd "NUEVO FRONTEND"
python3 -m http.server 8080
```

Abre `http://localhost:8080` en el navegador.

### DBeaver / cliente SQL

| Parámetro | Valor |
|-----------|-------|
| Host | `localhost` |
| Puerto | `5432` |
| Base de datos | `padelnet` |
| Usuario | `padelnet_user` |
| Contraseña | `padelnet` |

### Scripts de npm disponibles (backend)

```bash
npm run dev      # ts-node-dev con hot-reload
npm run build    # Compilar TypeScript → dist/
npm run start    # Ejecutar versión compilada (producción)
npm run lint     # ESLint
npm run test     # Jest (sin tests escritos aún)
npm run migrate  # Ejecutar migraciones JS (no usa este archivo SQL)
```

---

## 5. Variables de entorno

Fichero: `backend/.env`

```env
# Servidor
PORT=3000
NODE_ENV=development

# PostgreSQL
DB_HOST=localhost
DB_PORT=5432
DB_NAME=padelnet
DB_USER=padelnet_user
DB_PASSWORD=padelnet

# JWT
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_REFRESH_SECRET=your-super-secret-refresh-key-change-in-production
JWT_EXPIRES_IN=24h
JWT_REFRESH_EXPIRES_IN=7d

# Firebase (push notifications — opcional en desarrollo)
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_PRIVATE_KEY=your-firebase-private-key
FIREBASE_CLIENT_EMAIL=your-firebase-client-email

# CORS — orígenes permitidos separados por coma
CORS_ORIGIN=http://localhost:3000,http://localhost:8080

# Job semanal de actividad
ACTIVITY_CHECK_CRON=0 0 * * 0     # Cada domingo a las 00:00
ACTIVITY_PENALTY_POINTS=3          # Puntos descontados por inactividad
ACTIVITY_MAX_INFRACTIONS=3         # Infracciones máximas antes de avisar
```

---

## 6. Base de datos

### Tecnología
PostgreSQL 15. ORM: Sequelize 6 en el backend. Schema creado con `database/migrations/001_initial_schema.sql`.

### Diagrama de entidades

```
users
  │
  ├──< teams (captainId → users.id)
  │      │
  │      ├──< team_players (teamId, userId) — muchos-a-muchos users↔teams
  │      │
  │      └──< leagues (adminId → users.id)
  │               │
  │               └──< divisions (leagueId)
  │                        │
  │                        └──< seasons (divisionId)
  │                                 │
  │                                 ├──< matches (seasonId, homeTeamId, awayTeamId)
  │                                 │      │
  │                                 │      ├──< match_results (matchId, gameNumber)
  │                                 │      │
  │                                 │      └──< lineups (matchId, teamId, player1Id, player2Id)
  │                                 │
  │                                 ├──< penalties (teamId, seasonId, appliedBy → users.id)
  │                                 │
  │                                 └──< activity_logs (teamId, seasonId)
```

### Tablas detalladas

#### `users`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | SERIAL PK | |
| email | VARCHAR(255) UNIQUE NOT NULL | |
| password | VARCHAR(255) NOT NULL | bcrypt hash |
| firstName | VARCHAR(100) NOT NULL | |
| lastName | VARCHAR(100) NOT NULL | |
| phone | VARCHAR(20) | nullable |
| role | VARCHAR(20) CHECK | `player`, `captain`, `admin` |
| isActive | BOOLEAN | default true |
| createdAt | TIMESTAMPTZ | auto |
| updatedAt | TIMESTAMPTZ | auto (trigger) |

#### `teams`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | SERIAL PK | |
| name | VARCHAR(255) NOT NULL | |
| captainId | INTEGER FK → users | |
| description | TEXT | nullable |
| isActive | BOOLEAN | default true |
| createdAt / updatedAt | TIMESTAMPTZ | auto |

#### `leagues`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | SERIAL PK | |
| name | VARCHAR(255) NOT NULL | |
| description | TEXT | nullable |
| adminId | INTEGER FK → users | usuario admin de la liga |
| isActive | BOOLEAN | default true |

#### `divisions`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | SERIAL PK | |
| leagueId | INTEGER FK → leagues | |
| name | VARCHAR(255) | Ej: "División 1" |
| level | INTEGER | 1 = D1, 2 = D2 ... |
| isActive | BOOLEAN | |

#### `seasons`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | SERIAL PK | |
| divisionId | INTEGER FK → divisions | |
| name | VARCHAR(255) | Ej: "Temporada 2025" |
| startDate | TIMESTAMPTZ | |
| endDate | TIMESTAMPTZ | nullable |
| status | VARCHAR | `planning`, `active`, `finished` |

#### `team_players` (tabla pivote)
| Columna | Tipo | Notas |
|---------|------|-------|
| id | SERIAL PK | |
| teamId | INTEGER FK → teams | UNIQUE(teamId, userId) |
| userId | INTEGER FK → users | |
| joinedAt | TIMESTAMPTZ | fecha de alta |
| isActive | BOOLEAN | baja suave |

#### `matches`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | SERIAL PK | |
| seasonId | INTEGER FK → seasons | |
| homeTeamId | INTEGER FK → teams | |
| awayTeamId | INTEGER FK → teams | |
| matchDate | TIMESTAMPTZ | |
| weekNumber | INTEGER | Jornada |
| status | VARCHAR | `scheduled`, `in_progress`, `completed`, `cancelled` |
| homeTeamConfirmed | BOOLEAN | default false |
| awayTeamConfirmed | BOOLEAN | default false |

Los dos flags `homeTeamConfirmed` y `awayTeamConfirmed` son el mecanismo de confirmación doble. Un partido pasa a `completed` cuando los dos equipos confirman el resultado.

#### `match_results`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | SERIAL PK | |
| matchId | INTEGER FK → matches | |
| gameNumber | INTEGER | Número de partido del enfrentamiento (1, 2...) |
| homeTeamScore | INTEGER | Marcador local |
| awayTeamScore | INTEGER | Marcador visitante |

En el pádel un enfrentamiento puede tener varios partidos (parejas). `gameNumber` identifica cada uno.

#### `lineups`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | SERIAL PK | |
| matchId | INTEGER FK → matches | |
| teamId | INTEGER FK → teams | |
| pairNumber | INTEGER | Número de pareja (1, 2...) |
| player1Id | INTEGER FK → users | |
| player2Id | INTEGER FK → users | |

#### `penalties`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | SERIAL PK | |
| teamId | INTEGER FK → teams | |
| seasonId | INTEGER FK → seasons | |
| type | VARCHAR | `automatic`, `manual` |
| reason | VARCHAR | `no_activity`, `late_result`, `no_show`, `other` |
| points | INTEGER | Puntos a descontar (siempre positivo) |
| description | TEXT | nullable |
| appliedBy | INTEGER FK → users | nullable — admin que aplicó (solo manual) |

#### `activity_logs`
| Columna | Tipo | Notas |
|---------|------|-------|
| id | SERIAL PK | |
| teamId | INTEGER FK → teams | |
| seasonId | INTEGER FK → seasons | |
| weekStartDate | DATE | Inicio de la semana |
| weekEndDate | DATE | Fin de la semana |
| matchesPlayed | INTEGER | Partidos completados esa semana |
| infractionCount | INTEGER | Infracciones acumuladas del equipo |

### Triggers automáticos

La migración SQL instala un trigger `set_updated_at` en todas las tablas, que actualiza automáticamente `updatedAt` en cada UPDATE.

---

## 7. Backend — Arquitectura

### Arranque (`src/app.ts`)

1. Carga `.env` con dotenv.
2. Configura middlewares globales: `helmet`, `cors`, `rate-limit`, `json parser`.
3. Registra rutas bajo `/api/`.
4. Expone `GET /health` (sin autenticación) para healthchecks.
5. En `startServer()`: autentica con la BD, hace `sequelize.sync()` (sin alter), arranca el servidor HTTP, lanza el job de actividad semanal.

### Capa de modelos (`src/models/`)

Cada modelo extiende `Model<Attributes, CreationAttributes>` de Sequelize. Las asociaciones se declaran al final de cada archivo. El archivo `index.ts` re-exporta todos los modelos y el enum `UserRole` para que el resto del código haga `import { User, Team, UserRole } from '../models'`.

### Capa de servicios (`src/services/`)

Toda la lógica de negocio vive aquí. Los controladores solo llaman servicios y traducen el resultado a HTTP.

- **`AuthService`**: registro (hash bcrypt + unicidad email), login (verificación password), generación de tokens JWT, refresh.
- **`ActivityService`**: itera temporadas activas, por cada una busca partidos de la semana, por cada equipo en esos partidos verifica si jugó. Si `matchesPlayed === 0` delega en `PenaltyService` y actualiza el contador de infracciones.
- **`PenaltyService`**: crea penalizaciones en BD, las lista, calcula el total de puntos, elimina manuales.

### Middleware de autenticación (`src/middleware/auth.middleware.ts`)

Dos funciones exportadas:

1. **`authenticateToken`**: extrae el Bearer token del header `Authorization`, lo verifica con `jwtConfig.secret`, carga el usuario de la BD y lo adjunta a `req.user`. Si el usuario no existe o está inactivo, devuelve 401.

2. **`requireRole(...roles)`**: factory que devuelve un middleware. Comprueba que `req.userRole` está en la lista de roles permitidos. Se usa así:
   ```typescript
   router.get('/', requireRole(UserRole.ADMIN), handler);
   ```

### Job de actividad (`src/jobs/activity-check.job.ts`)

Se programa con `node-cron` al arrancar el servidor. La expresión cron es configurable via `ACTIVITY_CHECK_CRON` (por defecto cada domingo a las 00:00). Llama a `activityService.checkWeeklyActivity()`. También exporta `runActivityCheckManually()` para testing.

---

## 8. API REST — Endpoints

### Base URL
`http://localhost:3000/api`

### Autenticación
Los endpoints protegidos requieren el header:
```
Authorization: Bearer <access_token>
```

---

### Auth (`/api/auth`)

#### `POST /api/auth/register`
Crea un nuevo usuario.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "min6chars",
  "firstName": "Nombre",
  "lastName": "Apellido"
}
```

**Respuesta 201:**
```json
{
  "message": "User registered successfully",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "firstName": "Nombre",
    "lastName": "Apellido",
    "role": "player",
    "isActive": true,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errores:** 400 si el email ya existe o falla la validación.

---

#### `POST /api/auth/login`
Autentica un usuario y devuelve tokens JWT.

**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Respuesta 200:**
```json
{
  "message": "Login successful",
  "user": { ... },
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Errores:** 401 si credenciales inválidas o usuario inactivo.

---

#### `POST /api/auth/refresh`
Genera un nuevo par de tokens usando el refresh token.

**Body:**
```json
{
  "refreshToken": "eyJ..."
}
```

**Respuesta 200:**
```json
{
  "tokens": {
    "accessToken": "eyJ...",
    "refreshToken": "eyJ..."
  }
}
```

**Errores:** 400 si no se envía refresh token, 401 si es inválido o el usuario no existe.

---

#### `GET /api/auth/profile` 🔒
Devuelve los datos del usuario autenticado (sin contraseña).

**Respuesta 200:**
```json
{
  "user": {
    "id": 1,
    "email": "...",
    "firstName": "...",
    "lastName": "...",
    "role": "player",
    ...
  }
}
```

---

### Users (`/api/users`) 🔒 — **TODO**

| Método | Ruta | Auth requerida | Estado |
|--------|------|---------------|--------|
| GET | `/api/users` | Admin | TODO |
| GET | `/api/users/:id` | Cualquier usuario | TODO |

---

### Teams (`/api/teams`) 🔒 — **TODO**

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/api/teams` | Listar todos | TODO |
| GET | `/api/teams/:id` | Obtener uno | TODO |
| POST | `/api/teams` | Crear equipo | TODO |

---

### Leagues (`/api/leagues`) 🔒 — **TODO**

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/api/leagues` | Listar ligas | TODO |
| GET | `/api/leagues/:id` | Obtener una | TODO |
| POST | `/api/leagues` | Crear liga | TODO |

---

### Matches (`/api/matches`) 🔒 — **TODO**

| Método | Ruta | Descripción | Estado |
|--------|------|-------------|--------|
| GET | `/api/matches` | Listar partidos | TODO |
| GET | `/api/matches/:id` | Obtener uno | TODO |
| POST | `/api/matches/:id/confirm` | Confirmar resultado | TODO |

---

### Health check (sin auth)

`GET /health` → `{ "status": "ok", "timestamp": "..." }`

---

## 9. Sistema de autenticación JWT

### Flujo completo

```
Cliente                         Backend
  │                                │
  ├── POST /auth/register ─────────►
  │                                ├── Valida campos (express-validator)
  │                                ├── Comprueba unicidad email
  │                                ├── bcrypt.hash(password, 10)
  │                                ├── User.create(...)
  │◄── 201 { user } ───────────────┤
  │                                │
  ├── POST /auth/login ────────────►
  │                                ├── User.findOne({ email })
  │                                ├── bcrypt.compare(password, hash)
  │                                ├── jwt.sign({ userId, role }, secret, { expiresIn: 24h })
  │                                ├── jwt.sign({ userId, role }, refreshSecret, { expiresIn: 7d })
  │◄── 200 { user, tokens } ───────┤
  │                                │
  ├── GET /auth/profile ───────────►
  │   Authorization: Bearer <access>
  │                                ├── jwt.verify(token, secret)
  │                                ├── User.findByPk(decoded.userId)
  │                                ├── Adjunta user a req.user
  │◄── 200 { user } ───────────────┤
  │                                │
  │   (access token expirado)      │
  ├── POST /auth/refresh ──────────►
  │   { refreshToken }             ├── jwt.verify(refreshToken, refreshSecret)
  │                                ├── User.findByPk(decoded.userId)
  │                                ├── Genera nuevo par de tokens
  │◄── 200 { tokens } ─────────────┤
```

### Payload del token JWT

```json
{
  "userId": 1,
  "role": "player",
  "iat": 1234567890,
  "exp": 1234567890
}
```

### Roles y permisos

| Rol | Valor en BD | Acceso |
|-----|------------|--------|
| Jugador | `player` | Ver su perfil, ver partidos/equipos/ligas |
| Capitán | `captain` | Lo anterior + gestionar su equipo, confirmar partidos |
| Admin | `admin` | Acceso total, incluyendo `GET /api/users` |

El middleware `requireRole(UserRole.ADMIN)` comprueba el rol en el JWT (no vuelve a tocar la BD para el rol, solo para verificar que el usuario existe y está activo).

---

## 10. Sistema de penalizaciones y actividad semanal

### Flujo del job

Cada domingo a las 00:00 (configurable con `ACTIVITY_CHECK_CRON`):

```
startActivityCheckJob()
  └── activityService.checkWeeklyActivity()
        ├── Season.findAll({ status: 'active' })
        │
        └── Por cada temporada activa:
              ├── Match.findAll({ seasonId, matchDate: últimos 7 días })
              ├── Extrae IDs únicos de equipos (home + away)
              │
              └── Por cada equipo:
                    ├── Cuenta partidos COMPLETADOS en la semana
                    ├── Busca/crea ActivityLog de esa semana
                    │
                    ├── Si matchesPlayed === 0:
                    │     ├── penaltyService.applyPenalty({
                    │     │     type: 'automatic',
                    │     │     reason: 'no_activity',
                    │     │     points: ACTIVITY_PENALTY_POINTS (default 3)
                    │     │   })
                    │     └── activityLog.infractionCount += 1
                    │
                    └── Si infractionCount >= ACTIVITY_MAX_INFRACTIONS (default 3):
                          └── console.warn (TODO: lógica de descenso/expulsión)
```

### Tipos de penalización

| type | reason | Quién la aplica |
|------|--------|----------------|
| `automatic` | `no_activity` | Job semanal |
| `automatic` | `late_result` | (reservado) |
| `automatic` | `no_show` | (reservado) |
| `manual` | `other` | Admin vía API |

Las penalizaciones manuales se pueden eliminar con `penaltyService.removePenalty(id)`. Las automáticas no se pueden borrar.

### Ejecución manual (testing)

```typescript
import { runActivityCheckManually } from './jobs/activity-check.job';
await runActivityCheckManually();
```

---


## 11. Frontend Web (React + Babel Standalone)

### Filosofía de Arquitectura
El frontend no usa bundler (Webpack/Vite). Los archivos `.jsx` se cargan mediante etiquetas `<script type="text/babel">` y se transpilan en el navegador usando Babel Standalone. Debe servirse mediante un servidor HTTP básico (ej: `python3 -m http.server 8080`).

### Lógica Dinámica de Roles en la Interfaz
La experiencia de usuario cambia drásticamente dependiendo del rol (`user.role`), devuelto en el JWT de autenticación tras el inicio de sesión real contra la API:

**1. Contexto y Filtrado de Datos (`data.jsx` y `api.jsx`)**
* El usuario global `window.PN_ME` tomará dinámicamente el rol del backend.
* **Filtrado:** En base al rol, el sistema filtra la información visible en la app. Si eres `player` o `captain`, el array de `PN_MATCHES` se filtra para mostrar **solo los partidos de tu equipo**. Si eres `admin`, los ves todos.
* **Acciones Rápidas:** Las variables `PN_QUICK_ACTIONS` se construyen según los permisos.

**2. Dashboard Condicional (`desk-dashboard.jsx`)**
El dashboard principal renderiza componentes completamente diferentes según el rol:
* 👑 **Panel Admin:** Vista gerencial. Muestra KPIs (Total usuarios, Equipos registrados, Partidos en curso), alertas del sistema (equipos inactivos sujetos a penalización) y botones para Crear Ligas o Gestionar Temporadas.
* 🛡️ **Panel Capitán:** Vista de gestión de equipo. Muestra alertas pendientes ("Confirma el resultado del último partido"), el próximo encuentro de su equipo, y accesos directos para la función de **Crear Equipo / Editar Plantilla**.
* 🎾 **Panel Jugador:** Vista de rendimiento. Enfocada en "Mi próximo partido", "Clasificación de mi equipo" y estadísticas individuales.

**3. Navegación y Permisos Seguros (`desk-shell.jsx`)**
La barra lateral (`sidebar`) oculta o muestra accesos directos:
* La pestaña **"Panel de Control"** (gestión de penalizaciones y usuarios) solo es visible para `admin`.
* La pestaña **"Mi Equipo"** muestra opciones de solo lectura para jugadores, pero activa botones de **"Crear Equipo"**, **"Editar Nombre"** y **"Añadir/Eliminar Jugador"** si el rol es `captain` o `admin`.

### Creación de Equipos (Requisito Crítico)
El frontend debe incluir un modal o vista dedicada a la creación de nuevos equipos.
* Un usuario (por defecto jugador) puede usar la acción "Crear Nuevo Equipo".
* Al rellenar el nombre y detalles, el sistema llama al backend (`POST /api/teams`).
* Al crearse el equipo, el backend asciende automáticamente a este usuario al rol de `captain` y le asigna ese equipo.
* El frontend debe actualizar el JWT/contexto para reflejar este nuevo rol y mostrar los paneles de capitán inmediatamente.

### Vistas Disponibles
| Archivo | Contenido / Renderizado Condicional |
|---------|-----------|
| `desk-dashboard.jsx` | Bienvenida diferenciada (Admin / Capitán / Jugador). |
| `desk-leagues.jsx` | Tabla de clasificación. Botón "Añadir Liga" solo para Admins. |
| `desk-matches.jsx` | Partidos. Capitanes ven botones para "Confirmar Resultado". |
| `desk-teams.jsx` | Detalle del equipo. **Incluye formulario para Crear Equipo y gestionar plantilla**. |
| `desk-profile.jsx` | Perfil del usuario, stats y botón de cerrar sesión. |

---

## 12. Frontend Flutter

### Estado actual

La arquitectura está completa con Clean Architecture (data / domain / presentation). Las pantallas de autenticación tienen UI básica. El resto de pantallas son stubs con texto "Coming soon" o similar.

### Estructura relevante

```dart
// core/config/app_config.dart
class AppConfig {
  static const String apiBaseUrl = 'http://localhost:3000/api';
}
```

```yaml
# pubspec.yaml — dependencias clave
flutter_riverpod: ^2.4.9     # State management
go_router: ^13.0.0           # Navegación declarativa
dio: ^5.4.0                  # HTTP client
retrofit: ^4.0.3             # Generación de cliente API
flutter_secure_storage: ^9.0.0  # Almacenamiento seguro de tokens
firebase_core + firebase_messaging  # Push notifications
json_serializable + freezed  # Code generation para modelos
```

### Para arrancar Flutter

```bash
cd frontend
flutter pub get
flutter pub run build_runner build --delete-conflicting-outputs
flutter run  # Selecciona dispositivo: web, android, iOS
```

Flutter **no está instalado** en el sistema actual. Hay que instalarlo por separado.

---

## 13. Estado actual y TODOs

### Instrucciones de construcción del Frontend Web (TODOs)
Como estás construyendo desde cero, asegúrate de implementar lo siguiente en React:
- [ ] Configurar el enrutamiento base con `desk-shell.jsx` controlando el estado de la vista (`view`).
- [ ] Integrar un sistema de mock data inicial (`data.jsx`) que intercepte y asigne correctamente el rol devuelto por la API.
- [ ] Programar los tres componentes de Dashboard separados (`AdminDashboard`, `CaptainDashboard`, `PlayerDashboard`).
- [ ] **Creación de equipos:** Implementar el formulario en `desk-teams.jsx`, su llamada asíncrona a la API, y la lógica para escalar el rol del usuario a `captain` en tiempo real.
- [ ] Implementar botones de confirmación de partido restringidos por rol.

---

*Documento generado el 2026-06-28. Refleja el estado del proyecto en esa fecha.*
