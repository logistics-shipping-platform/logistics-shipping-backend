# Logistics Shipping Backend

Sistema backend para cotización, creación y monitoreo de envíos logísticos en tiempo real, basado en Node.js y arquitectura hexagonal.

---

## Table of Contents

1. [Tecnologías](#tecnologías)
2. [Arquitectura](#arquitectura)
3. [Requisitos Previos](#requisitos-previos)
4. [Instalación](#instalación)
5. [Configuración](#configuración)
6. [Docker Compose](#docker-compose)
7. [Ejecución](#ejecución)
8. [Scripts](#scripts)
9. [Estructura de Carpetas](#estructura-de-carpetas)
10. [Variables de Entorno](#variables-de-entorno)
11. [Endpoints HTTP](#endpoints-http)
12. [WebSocket](#websocket)
13. [Testing](#testing)
14. [Convenciones de Branching](#convenciones-de-branching)
15. [Contribuir](#contribuir)
16. [Licencia](#licencia)

---

## Tecnologías

- **Node.js** v18+
- **Express**
- **TypeScript**
- **MySQL**
- **Redis** (cache)
- **Socket.IO** (notificaciones en tiempo real)
- **JWT** (autenticación)
- **Jest** (unit & integration testing)

---

## Arquitectura

Hexagonal (Ports & Adapters):

- **Domain**: entidades (`Shipment`, `City`, etc.), eventos y puertos (interfaces).
- **Application**: casos de uso (Use Cases) que orquestan lógica de negocio.
- **Adapters**:
  - **Inbound** (HTTP controllers).
  - **Outbound** (MySQL repository, Redis cache adapter, JWT service, Socket.IO notifier).

---

## Requisitos Previos

- Git
- Node.js + npm
- Docker & Docker Compose

---

## Instalación

```bash
# Clona el repositorio
git clone https://github.com/logistics-shipping-platform/logistics-shipping-backend.git
cd logistics-shipping-backend

# Instala dependencias
npm install
```

---

## Configuración

Copia `.env.example` a `.env` y ajusta los valores:

```env
API_GATEWAY_PORT=3000
JWT_SECRET=<tu_secreto>

MYSQL_HOST=db
MYSQL_PORT=3306
MYSQL_DATABASE=logistics
MYSQL_USER=appuser
MYSQL_PASSWORD=apppass
MYSQL_ROOT_PASSWORD=rootpass

REDIS_URL=redis://localhost:6379
CACHE_CITY_TTL=3600
WS_WATCHER_INTERVAL=3000
```

---

## Docker Compose

Levanta MySQL, Adminer y Redis:

```bash
docker-compose up -d
```

- **MySQL**: puerto `3306`, usuarios y tablas inicializadas via `db/init.sql`.
- **Adminer**: puerto `8080` para gestión de BD.
- **Redis**: puerto `6379` para cache.

---

## Ejecución

- **Desarrollo**:
  ```bash
  npm run dev
  ```
- **Build & Start**:
  ```bash
  npm run build
  npm start
  ```

El servidor corre en `http://localhost:3000`.

---

## Scripts

| Comando         | Descripción                      |
| --------------- | -------------------------------- |
| `npm run dev`   | Ejecuta con hot-reload (ts-node) |
| `npm run build` | Compila TypeScript a `dist/`     |
| `npm start`     | Ejecuta el build compilado       |
| `npm test`      | Corre unit & integration tests   |

---

## Estructura de Carpetas

```
db/
├── init.sql       # Script de creación base de datos
src/
├── adapter/
│   ├── inbound/   # HTTP controllers, DTOs
│   ├── outbound/  # Repositorios (MySQL, Redis), auth, messaging, cache
├── application/   # Use Cases
├── config/        # Conexion MySQL
├── domain/
│   ├── model/     # Entidades (city, fare, parce, shipment, user)
│   ├── event/     # Eventos de dominio
│   └── port/      # Puertos inbound & outbound
│   └── service/   # Servicios de dominio
└── index.ts       # Entrypoint HTTP + WS
docker-compose.yml # Orquestación de MySQL, Redis y Adminer
```

---

## Variables de Entorno

| Nombre                | Descripción                                               |
| --------------------- | ----------------------------------------------------------|
| `API_GATEWAY_PORT`    | Puerto HTTP del API (default `3000`)                      |
| `JWT_SECRET`          | Secreto para firma de JWT                                 |
| `MYSQL_HOST`          | Host de MySQL (e.g. `db`)                                 |
| `MYSQL_PORT`          | Puerto de MySQL (default `3306`)                          |
| `MYSQL_DATABASE`      | Nombre de la base de datos                                |
| `MYSQL_USER`          | Usuario de la base de datos                               |
| `MYSQL_PASSWORD`      | Contraseña de la base de datos                            |
| `REDIS_URL`           | URL de Redis (ej. `redis://redis:6379`)                   |
| `CACHE_CITY_TTL`      | TTL en segundos para cache de ciudades                    |
| `WS_WATCHER_INTERVAL` | Intervalo ms para watcher de cambios de shipment en la db |

---

## Endpoint HTTP

La documentación completa del API está disponible en SwaggerHub:  
➡️ [Ver documentación OpenAPI (Swagger)](https://app.swaggerhub.com/apis/daniel-aa5/logistics-shipping/1.0.0)

---

## WebSocket

- **URL**: `ws://localhost:3000/ws`
- **Handshake**: enviar JWT en `auth.token`.
- **Eventos**:
  - Cliente `socket.emit('subscribe','shipments.{id}')`
  - Servidor `socket.emit('shipment.updated', { shipmentId, newState, changedAt })`

---

## Testing

- Unit tests en `test/unit/`
- Integration tests en `test/integration/`
- Ejecutar:
  ```bash
  npm test
  ```