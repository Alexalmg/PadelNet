# PadelNet — Liga de Pádel Online

Plataforma web completa para gestionar ligas de pádel: equipos, partidos, clasificaciones, clubes y comunicación entre capitanes.

---

## Qué hace la aplicación

PadelNet permite organizar una liga de pádel de principio a fin:

- **Jugadores** se registran, verifican su email y solicitan ser capitán
- **Capitanes** crean su equipo, invitan jugadores (por username) y gestionan su plantilla
- **Partidos** se generan automáticamente en formato round-robin por jornadas
- Los capitanes **proponen fecha y club** para cada partido; el rival acepta o contraoferta
- Los capitanes asignan la **alineación** (2 jugadores por equipo) antes de jugar
- Los jugadores alineados o el capitán **suben el resultado** por sets tras el partido
- Ambos capitanes **confirman** el resultado para marcarlo como completado
- Se pueden abrir **disputas** si hay desacuerdo; el admin las resuelve
- Tras cada partido se votan el **MVP** y el fair play del equipo rival
- **Clasificación en tiempo real** con ELO, rachas, sets y logros desbloqueables
- **Mapa de clubes** interactivo con partidos de la semana y links a Waze/Apple Maps/Google Maps
- **Chat** por partido entre los capitanes
- Panel de **anuncios** y **patrocinadores** gestionado por el admin
- Sistema de **notificaciones** in-app para invitaciones, solicitudes y propuestas pendientes

---

## Stack tecnológico

### Backend
| Tecnología | Uso |
|---|---|
| **Node.js 18 + TypeScript** | Runtime y lenguaje |
| **Express 4** | Framework HTTP |
| **Sequelize 6** | ORM (modelos, migraciones en runtime) |
| **PostgreSQL 15** | Base de datos relacional |
| **JWT** | Autenticación (access token 24h + refresh 7d) |
| **bcryptjs** | Hash de contraseñas |
| **Mailjet HTTP API** | Envío de emails de verificación |
| **node-cron** | Job semanal de comprobación de actividad |
| **helmet + express-rate-limit** | Seguridad y protección ante abuso |
| **express-validator** | Validación de inputs |

### Frontend
| Tecnología | Uso |
|---|---|
| **HTML + CSS + Vanilla JS** | SPA sin frameworks, fichero único `index.html` |
| **Leaflet.js 1.9.4** | Mapa interactivo de clubes (OpenStreetMap) |
| **nginx** | Sirve el frontend en producción/Docker |

### Infraestructura
| Tecnología | Uso |
|---|---|
| **Docker + Docker Compose** | Entorno local (postgres + backend + frontend) |
| **Render** | Despliegue en producción (Docker) |
| **Neon** | PostgreSQL en la nube (producción) |

---

## Estructura del proyecto

```
PADELNET/
├── backend/
│   ├── src/
│   │   ├── app.ts                  # Entry point, middlewares, migraciones en runtime
│   │   ├── seed.ts                 # Datos de prueba (trunca y reinsertas en cada arranque local)
│   │   ├── config/
│   │   │   └── database.ts         # Conexión Sequelize (SSL en prod, sin SSL en local)
│   │   ├── models/                 # 25 modelos Sequelize
│   │   ├── controllers/            # Lógica de negocio por recurso
│   │   ├── routes/                 # Definición de rutas REST
│   │   ├── services/               # Lógica reutilizable (stats, emails, proposals…)
│   │   ├── middleware/             # Auth JWT, control de roles
│   │   └── jobs/                   # Cron job de actividad semanal
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── index.html                  # SPA completa (HTML + CSS + JS en un solo fichero)
│   ├── Dockerfile
│   └── nginx.conf
├── database/
│   └── migrations/
│       └── 001_initial_schema.sql  # Schema base (Sequelize sync crea el resto)
├── docker-compose.yml
├── render.yaml                     # Config de despliegue en Render
└── Dockerfile                      # Dockerfile raíz para Render (copia backend + frontend)
```

---

## Modelos de datos

| Modelo | Descripción |
|---|---|
| `User` | Jugador/capitán/admin. Email verificado, username único, perfil de pádel |
| `Team` | Equipo. Un capitán, muchos jugadores. Un capitán = un equipo |
| `TeamPlayer` | Relación usuario–equipo |
| `TeamInvitation` | Capitán invita a jugador por username |
| `TeamJoinRequest` | Jugador solicita unirse a un equipo |
| `League` | Liga (nombre, descripción, admin) |
| `Division` | División dentro de una liga |
| `Season` | Temporada dentro de una división |
| `Match` | Partido: equipos, fecha, club, estado, confirmaciones |
| `MatchResult` | Sets del partido (gameNumber, homeTeamScore, awayTeamScore) |
| `Lineup` | Alineación: 2 jugadores por equipo por partido |
| `MatchProposal` | Propuesta de fecha+club entre capitanes |
| `MatchMessage` | Mensaje de chat en un partido |
| `MatchDispute` | Disputa abierta por un capitán |
| `MvpVote` | Voto MVP + puntuación fair play |
| `PlayerStats` | Stats por temporada: partidos, victorias, ELO, MVP, racha |
| `CaptainRequest` | Solicitud de un player para convertirse en capitán |
| `MatchRequest` | Solicitud de partido entre capitanes (fuera del calendario) |
| `Club` | Club de pádel con coordenadas GPS |
| `Achievement` | Catálogo de logros |
| `UserAchievement` | Logros desbloqueados por usuario |
| `Penalty` | Penalización a un equipo por inactividad |
| `ActivityLog` | Registro de actividad semanal |
| `Payment` | Cuota de inscripción por equipo/temporada |
| `Sponsor` | Patrocinadores mostrados en el frontend |
| `Announcement` | Anuncios del admin (pinnables) |

---

## Flujo de un partido

```
pending_proposal → proposed → scheduled → in_progress → completed
                                                       ↘ disputed → (resolved)
```

1. `pending_proposal` — partido creado, sin fecha acordada
2. Un capitán propone fecha + club → `proposed`
3. El rival acepta → `scheduled` (o contraoferta → vuelve a `proposed`)
4. Capitanes asignan alineación (`POST /matches/:id/lineup`)
5. Jugador alineado o capitán sube el resultado por sets → `in_progress`
6. Ambos capitanes confirman → `completed`
7. Se habilitan votos MVP y actualización de estadísticas

---

## API REST — Resumen de endpoints

| Grupo | Base | Acciones principales |
|---|---|---|
| **Auth** | `/api/auth` | register, login, refresh, profile, verify-email |
| **Users** | `/api/users` | list (admin), get, update-profile |
| **Teams** | `/api/teams` | CRUD, invite, join-request, add/remove player |
| **Matches** | `/api/matches` | list, get, lineup, results, confirm, proposals, chat, dispute, MVP |
| **Captain Requests** | `/api/captain-requests` | request, mine, approve/reject (admin) |
| **Team Invitations** | `/api/team-invitations` | mine, accept/decline |
| **Leagues** | `/api/leagues` | list, get, create (admin) |
| **Stats** | `/api/stats` | me, standings, player |
| **Clubs** | `/api/clubs` | list (con partidos semana), CRUD (admin) |
| **Announcements** | `/api/announcements` | list, create/pin/delete (admin) |
| **Sponsors** | `/api/sponsors` | list-active, CRUD (admin) |
| **Disputes** | `/api/disputes` | list (admin), resolve (admin) |
| **Payments** | `/api/payments` | list, paid/overdue/pending (admin) |
| **Notifications** | `/api/notifications` | list, count |
| **Achievements** | `/api/achievements` | all, mine, user |
| **Match Requests** | `/api/match-requests` | request, incoming, outgoing, accept/reject |

Todos los endpoints (excepto login, register y verify-email) requieren `Authorization: Bearer <token>`.

---

## Roles de usuario

| Rol | Permisos |
|---|---|
| `player` | Registrarse, ver partidos/clasificación, solicitar ser capitán, unirse a equipos, votar fair play |
| `captain` | Todo lo de player + crear equipo, invitar jugadores, gestionar partidos, proponer fechas, asignar alineación, subir resultados, votar MVP |
| `admin` | Todo lo anterior + gestionar ligas/temporadas, aprobar capitanes, resolver disputas, gestionar clubes/anuncios/patrocinadores/pagos |

---

## Cómo arrancar en local

### Requisitos
- Docker y Docker Compose instalados

### 1. Clonar y configurar variables de entorno

```bash
git clone <repo>
cd PADELNET
cp .env.example .env   # ajusta MAILJET_API_KEY y MAILJET_SECRET_KEY si quieres emails reales
```

### 2. Levantar contenedores

```bash
docker compose up --build -d
```

O usa el script del Escritorio:
```bash
~/Escritorio/levantar-padelnet.sh
```

La aplicación estará disponible en **http://localhost**

### 3. Datos de prueba

El seed se ejecuta automáticamente en cada arranque y reinicia todos los datos:

| Usuario | Email | Contraseña | Rol |
|---|---|---|---|
| Admin principal | `admin@padelnet.com` | `Admin123!` | admin |
| Admin secundario | `alejandroaf2005@gmail.com` | `111111` | admin |
| Capitán 1 (Raquetas FC) | `capitan1@padelnet.com` | `Captain123!` | captain |
| Capitán 2 (Padel Kings) | `capitan2@padelnet.com` | `Captain123!` | captain |
| … | `capitan3-8@padelnet.com` | `Captain123!` | captain |
| Jugador 1 del equipo 1 | `jugador1_1@padelnet.com` | `Player123!` | player |

Los datos incluyen: 8 equipos, 28 partidos (20 completados + 4 esta semana + 4 pendientes), 20 clubes de Madrid, clasificación con ELO, anuncios y patrocinadores.

---

## Variables de entorno

| Variable | Descripción | Default local |
|---|---|---|
| `NODE_ENV` | `development` / `production` | `development` |
| `PORT` | Puerto del backend | `3000` |
| `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD` | Conexión PostgreSQL local | configurado en docker-compose |
| `DATABASE_URL` | URL de conexión en producción (Neon) | — |
| `JWT_SECRET` | Secreto de los access tokens | cambiar en prod |
| `JWT_REFRESH_SECRET` | Secreto de los refresh tokens | cambiar en prod |
| `SMTP_USER` | Mailjet API Key | — |
| `SMTP_PASS` | Mailjet Secret Key | — |
| `SMTP_FROM` | Dirección de origen de los emails | — |
| `APP_URL` | URL base para links en emails | `http://localhost` |

> Si `SMTP_USER` y `SMTP_PASS` no están definidos, el sistema auto-verifica los emails sin enviarlos (modo local sin Mailjet).

---

## Despliegue en producción (Render)

El `render.yaml` define un servicio Docker que:
1. Construye imagen desde el `Dockerfile` raíz (compila el backend TS + copia el `index.html` del frontend)
2. Sirve el frontend como estáticos desde Express (`express.static`)
3. Conecta a Neon PostgreSQL via `DATABASE_URL` (con SSL)
4. Envía emails reales via Mailjet HTTP API (evita bloqueo de puertos SMTP en Render)

Variables que debes configurar manualmente en el dashboard de Render:
- `DATABASE_URL`
- `SMTP_USER` (Mailjet API Key)
- `SMTP_PASS` (Mailjet Secret Key)
- `SMTP_FROM`
- `APP_URL` (ej: `https://padelnet.onrender.com`)

---

## Colección de API (Bruno)

En `~/Escritorio/PadelNet-API/` hay una colección Bruno con **79 requests** cubriendo todos los endpoints, organizados en 16 carpetas. Importa la carpeta en [Bruno](https://www.usebruno.com/) y selecciona el entorno **Local**.

Los requests de login guardan el token automáticamente en la variable de entorno (`adminToken`, `captainToken`, `playerToken`) para usarlo en el resto de llamadas.

---

## Rate limiting

| Entorno | Límite |
|---|---|
| Producción | 100 peticiones / 15 minutos por IP |
| Desarrollo | 10 000 peticiones / 15 minutos por IP |
