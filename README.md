## Descripción general
LearnIA User Management Lambda expone una API REST sobre AWS Lambda + API Gateway para registrar usuarios, autenticar sesiones JWT y gestionar progreso de rutas de aprendizaje en PostgreSQL. El proyecto aplica arquitectura hexagonal para aislar dominio, casos de uso y adaptadores, facilitando pruebas y despliegues mediante AWS SAM.

## Arquitectura y flujo
- Amazon API Gateway invoca la Lambda definida en `template.yml` que ejecuta `src/app.js:handler`.
- `aws-serverless-express` monta la aplicación Express creada por `ExpressApplicationFactory` (`src/infrastructure/web/ExpressApplicationFactory.js`).
- Middleware → Controladores → Casos de uso → Repositorios → PostgreSQL, todos resueltos por el contenedor DI (`src/infrastructure/DIContainer.js`).
- Se replica cada ruta con y sin prefijo `/api` para compatibilidad (ver eventos de `UserManagementFunction` en `template.yml`).

```
API Gateway
   ↓
AWS Lambda (handler)
   ↓
Express + Middlewares → Controladores → Use Cases → Repositorios → PostgreSQL (RDS)
```

## Stack técnico
- Node.js 20 + Express 4 (`package.json`)
- aws-serverless-express para adaptar Express en Lambda
- PostgreSQL mediante `pg`
- Bcrypt y JSON Web Tokens para seguridad
- AWS SAM + GitHub Actions (workflow `.github/workflows/deploy.yml`) para empaquetado y despliegue

## Estructura del proyecto
```text
.
├── template.yml
├── src/
│   ├── app.js                      # Handler Lambda y servidor local
│   ├── application/use-cases/      # Lógica de casos de uso
│   ├── domain/                     # Entidades y contratos
│   ├── infrastructure/
│   │   ├── config/                 # Configuración central
│   │   ├── database/               # Pool PostgreSQL
│   │   ├── persistence/            # Adaptadores PostgreSQL
│   │   ├── services/               # Servicios técnicos (JWT, bcrypt)
│   │   └── web/                    # Express, rutas, middleware
│   └── shared/errors/              # Errores comunes
├── tests/basic-test.js             # Script manual de smoke tests
└── layer-certs/certs/              # Bundle CA para conexiones SSL
```

## API/Interfaces
Las rutas se montan tanto en `/` como en `/api`. Todas las rutas de usuarios y learning paths requieren header `Authorization: Bearer <token>` salvo las que se indican como públicas.

### Autenticación (`src/infrastructure/web/routes/authRoutes.js`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| POST | `/auth/register` | Registro con validación de datos y hash de contraseña. |
| POST | `/auth/login` | Autenticación y creación de sesión persistida. |
| POST | `/auth/logout` | Invalidación de sesión activa (requiere token). |

### Usuarios (`src/infrastructure/web/routes/userRoutes.js`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/users/me` | Obtiene perfil propio. |
| GET | `/users/:id` | Restringido: solo retorna datos si `:id` coincide con el usuario autenticado. |
| PUT | `/users/me/profile` | Actualiza nombre, email, contraseña, teléfono o dirección. |
| PUT | `/users/:id/profile` | Igual que anterior con control de autorización. |
| GET | `/users/me/dashboard` | Dashboard resumido (usa perfil). |
| GET | `/users/:id/dashboard` | Igual que anterior con control de autorización. |
| GET | `/users/me/progress` | Resumen de progreso estudiantil. |
| GET | `/users/:id/progress` | Igual que anterior con control de autorización. |
| POST | `/users/me/progress` | Placeholder para registrar progreso puntual. |
| POST | `/users/:id/progress` | Placeholder equivalente con control de autorización. |

### Learning paths (`src/infrastructure/web/routes/learningPathRoutes.js`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/learning-paths` | Lista rutas personalizadas del usuario autenticado. |
| GET | `/learning-paths/public/list` | Versión que admite token opcional; sin usuario retornará `Requiere confirmación`. |
| GET | `/learning-paths/:pathId` | Detalle de ruta con cursos y progreso. |
| PATCH | `/learning-paths/:pathId/courses/:courseId` | Actualiza progreso de un curso dentro del path. |

### Sistema (`src/infrastructure/web/ExpressApplicationFactory.js`)
| Método | Ruta | Descripción |
| --- | --- | --- |
| GET | `/health` | Health check con ping a PostgreSQL. |
| GET | `/info` | Metadatos de servicio, endpoints y entorno. |

## Rutas o comandos con ejemplos
```bash
# Inicializar dependencias
npm install

# Copiar configuración base
cp .env.example .env

# Try it: registrar usuario (ajusta host según despliegue)
curl -X POST "$API_URL/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "identification": "1234567890",
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "password": "Sup3rSegura!",
    "phone": "+573001112233",
    "address": "Campus LearnIA",
    "type_user": "student"
  }'

# Try it: login
curl -X POST "$API_URL/auth/login" \
  -H "Content-Type: application/json" \
  -d '{ "email": "ada@example.com", "password": "Sup3rSegura!" }'

# Try it: obtener perfil propio
curl -X GET "$API_URL/users/me" \
  -H "Authorization: Bearer $TOKEN"
```

## Formatos de request/response (JSON)
```json
// POST /auth/register : body
{
  "identification": "1234567890",
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "password": "Sup3rSegura!",
  "phone": "+573001112233",
  "address": "Campus LearnIA",
  "type_user": "student"
}
```

```json
// POST /auth/register : 201
{
  "success": true,
  "message": "Usuario registrado exitosamente",
  "data": {
    "user": {
      "user_id": "uuid",
      "identification": "1234567890",
      "email": "ada@example.com",
      "name": "Ada Lovelace",
      "phone": "+573001112233",
      "address": "Campus LearnIA",
      "type_user": "student",
      "account_status": "active",
      "created_at": "2024-01-01T00:00:00.000Z",
      "updated_at": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

```json
// POST /auth/login : 200
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "user": { "...": "..." },
    "token": "jwt",
    "session_id": "uuid",
    "expires_at": "2024-01-02T00:00:00.000Z"
  }
}
```

```json
// Respuesta de error estándar
{
  "success": false,
  "message": "Datos inválidos",
  "errors": [
    "La contraseña debe tener al menos 8 caracteres"
  ]
}
```

## Códigos de error
| Código | HTTP | Mensaje | Fuente |
| --- | --- | --- | --- |
| `REGISTRATION_VALIDATION_FAILED` | 400 | Errores de validación en registro | `ValidationMiddleware.validateRegistration` y `RegisterUserUseCase` |
| `Datos de login inválidos` | 400 | Falta email/password | `ValidationMiddleware.validateLogin` |
| `MISSING_CREDENTIALS` | 400 | Credenciales faltantes | `LoginUserUseCase.execute` |
| `INVALID_CREDENTIALS` | 401 | Usuario o contraseña incorrectos | `LoginUserUseCase.execute` |
| `ACCOUNT_SUSPENDED` | 403 | Cuenta suspendida | `LoginUserUseCase` y `GetUserProfileUseCase` |
| `EMAIL_EXISTS` | 409 | Email en uso durante actualización | `UpdateUserProfileUseCase` |
| `23505` | 409 | Violación de unicidad en PostgreSQL | `ErrorHandlerMiddleware.handle` |
| `SESSION_EXPIRED` | 401 | Sesión expirada | `LogoutUserUseCase` |
| `SESSION_NOT_FOUND` | 404 | Sesión inexistente | `LogoutUserUseCase` |
| `MISSING_USER_ID` | 400 | Falta user_id | Casos de uso de perfil/progreso |
| `NO_UPDATES` | 400 | Nada que actualizar | `UpdateUserProfileUseCase` |
| `Token inválido` / `Token expirado` | 401 | JWT inválido o caducado | `AuthenticationMiddleware` |
| Otros (`REGISTRATION_ERROR`, `LOGIN_ERROR`, `LOGOUT_ERROR`, `UPDATE_ERROR`) | 500 | Errores no controlados específicos | Casos de uso y middleware |

## Configuración y variables de entorno

### Core de aplicación
| Variable | Descripción | Default/Origen |
| --- | --- | --- |
| `NODE_ENV` | Entorno de ejecución | `.env.example`: `development` |
| `PORT` | Puerto del servidor local | `.env.example`: `3000` (aplica a `startLocalServer`) |
| `MAX_REQUEST_SIZE` | Tamaño máximo del body en Express | `config/index.js`: `10mb` |
| `LOG_LEVEL` | Nivel de log | `config/index.js`: `info` |
| `LOG_FORMAT` | Formato de log | `config/index.js`: `combined` |
| `ENABLE_INTERNAL_CORS` | Habilita CORS dentro de Express | Default `true` si no corre en Lambda |
| `DEFAULT_ALLOW_ORIGIN` | Origen fallback para CORS | Requiere confirmación |

### Base de datos
| Variable | Descripción | Default/Origen |
| --- | --- | --- |
| `DATABASE_URL` | Cadena completa de conexión | SAM Parameter `DatabaseUrl` / `.env.example` sin default seguro |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Componentes individuales de conexión | `.env.example` |
| `DB_SSL` | Fuerza SSL | `.env.example`: `true` |
| `DB_CA_PATH` | Ruta al bundle CA | `template.yml`: `/opt/certs/rds-us-east-2-bundle.pem` |
| `DB_MAX_CONNECTIONS` | Pool máximo | `config/index.js`: `20` |
| `DB_IDLE_TIMEOUT` | Idle timeout ms | `config/index.js`: `30000` |
| `DB_CONNECTION_TIMEOUT` | Timeout de conexión ms | `config/index.js`: `2000` |

### Seguridad
| Variable | Descripción | Default/Origen |
| --- | --- | --- |
| `JWT_SECRET` | Clave del token | SAM Parameter `JWTSecret` (sin default) |
| `JWT_EXPIRES_IN` | TTL de JWT | `template.yml`: `24h` |
| `BCRYPT_ROUNDS` | Rondas bcrypt en Lambda | `template.yml`: `12` |
| `BCRYPT_SALT_ROUNDS` | Rondas bcrypt en servidor local | `config/index.js`: `12` |
| `CORS_ORIGIN` | Lista de orígenes permitidos | `template.yml`: `https://www.learn-ia.app,https://learn-ia.app,http://localhost:3000` |

### Infraestructura (SAM)
| Parámetro | Descripción | Default/Origen |
| --- | --- | --- |
| `Environment` | Sufijo del stack y `NODE_ENV` | `template.yml`: `dev` |
| `VpcSubnetIds`, `VpcSecurityGroupIds` | Recursos VPC para la Lambda | Sin default (requerido) |
| `RdsCaLayer` | Layer con certificados | `template.yml` (ruta `layer-certs/`) |

## Desarrollo local
- Requisitos: Node.js ≥ 20, PostgreSQL accesible, variables del `.env` configuradas.
- Ejecuta los comandos:
```bash
npm install
cp .env.example .env
# Ajusta credenciales y JWT_SECRET en .env
node src/app.js
```
- Nota: El script `npm start` llama a `node app.js`, pero ese archivo no existe en la raíz. Actualiza el script o utiliza `node src/app.js` (Requiere confirmación).
- Health local: `http://localhost:3000/health`.

## Pruebas
- Smoke tests manuales: `node tests/basic-test.js` (editar `BASE_URL` si es necesario).
- No hay suite automatizada (`npm test`) definida; incorporar Jest/Supertest está pendiente (Requiere confirmación).

## Despliegue
1. Validar y construir con SAM:
```bash
sam validate -t template.yml
sam build -t template.yml --use-container
```
2. Desplegar manualmente:
```bash
sam deploy \
  --template-file .aws-sam/build/template.yaml \
  --stack-name learnia-user-management-<env> \
  --region us-east-2 \
  --s3-bucket <bucket-artifacts> \
  --capabilities CAPABILITY_IAM \
  --parameter-overrides \
    Environment=<env> \
    DatabaseUrl=<secret> \
    JWTSecret=<secret> \
    CorsOrigin=<orígenes> \
    VpcSubnetIds=<subnet-list> \
    VpcSecurityGroupIds=<sg-list>
```
3. Pipeline CI/CD: `.github/workflows/deploy.yml` usa GitHub Actions con OIDC, `npm ci --production`, `sam build` y `sam deploy` por ambiente (`dev`, `staging`, `prod`).

## Observabilidad
- Logs estructurados en consola mediante `RequestLoggerMiddleware` (detallado en desarrollo, resumido en producción).
- `GET /health` verifica conectividad a PostgreSQL y tiempos de respuesta (`ExpressApplicationFactory.js`).
- `GET /info` entrega metadatos del servicio (nombre, versión, endpoints).
- CloudWatch Logs se genera automáticamente por Lambda; integración con métricas o tracing (X-Ray) aún no configurada (Requiere confirmación).

## Manejo de errores y validaciones
- `ValidationMiddleware` (registro, login, actualización) detiene solicitudes inválidas con respuestas 400.
- `AuthenticationMiddleware` verifica JWT, consulta `PostgreSQLUserSessionRepository`, valida sesiones activas e imprime errores 401/403.
- `ErrorHandlerMiddleware` centraliza códigos de negocio, traduce errores de PostgreSQL (23505/23503) y produce JSON estandarizado (`success: false`).
- Casos de uso aplican reglas de dominio (`User` y `UserSession`) antes de persistir cambios.

## Solución de problemas
- **La Lambda no puede conectarse al RDS**: verifica `VpcSubnetIds`, `VpcSecurityGroupIds` y que `DB_CA_PATH` apunte al certificado desplegado.
- **Errores CORS en el frontend**: ajústalos vía `CORS_ORIGIN` en parámetros SAM o `.env`; recuerda separar orígenes por coma y con esquema.
- **`npm start` falla**: actualizar script a `node src/app.js` o crear `app.js` en raíz; mientras tanto usar `node src/app.js`.
- **`SESSION_NOT_FOUND` al cerrar sesión**: el token debe ser el mismo emitido en login; tokens regenerados invalidan el hash almacenado.
- **`REGISTRATION_VALIDATION_FAILED`**: revisa campos obligatorios (`identification`, `name`, `email`, `password`) y reglas de longitud/formato.

## Seguridad
- Contraseñas hasheadas con bcrypt (`BcryptPasswordService`), configurable vía `BCRYPT_*`.
- Tokens JWT firmados con HS256 y almacenados como hash SHA-256 en la tabla de sesiones (`JWTTokenService`).
- CORS granular mediante `corsConfig.js`, con fallback de origen seguro.
- Lambda se ejecuta en subredes privadas con acceso controlado a RDS (según parámetros SAM).
- Secrets (`DatabaseUrl`, `JWTSecret`) suministrados desde AWS Secrets Manager/GitHub Actions secrets; no se materializan en repositorio.
- Middleware obliga a coincidencia entre `req.user.user_id` y parámetros routeados, evitando escalamiento horizontal.

## Esquema de datos
| Tabla | Campos relevantes | Fuente |
| --- | --- | --- |
| `users` | `user_id`, `identification`, `email`, `password_hash`, `name`, `phone`, `address`, `type_user`, `account_status`, `created_at`, `updated_at` | Consultas en `PostgreSQLUserRepository.js` |
| `user_sessions` | `session_id`, `user_id`, `jwt_token_hash`, `created_at`, `expires_at`, `is_active` | `PostgreSQLUserSessionRepository.js` |
| `user_learning_paths` | `path_id`, `name`, `description`, `status`, `progress_percentage`, `target_hours_per_week`, `target_completion_date`, `priority`, `is_public`, `created_at`, `updated_at`, `completed_at` | `PostgreSQLLearningPathRepository.js` |
| `course_progress` | `progress_id`, `path_id`, `mongodb_course_id`, `status`, `progress_percentage`, `time_invested_minutes`, `user_rating`, `personal_notes`, `sequence_order`, `dependencies_completed`, `started_at`, `completed_at`, `last_activity`, `created_at`, `updated_at` | `PostgreSQLLearningPathRepository.js` |
| Otros (roles, auditoría) | Por definir | Requiere confirmación |

## Licencia
MIT License (`package.json`).

## Notas y próximos pasos
- Unificar scripts de arranque (`npm start` vs. `src/app.js`).
- Incorporar suites automatizadas (Jest/Supertest) y actualizar workflow CI.
- Documentar/automatizar creación de tablas (DDL) y migraciones; actualmente inferidas desde consultas.
- Definir métricas y trazas (CloudWatch dashboards, X-Ray) para producción.
- Revisar manejo de errores `EMAIL_ALREADY_EXISTS` / `IDENTIFICATION_ALREADY_EXISTS` que hoy retornan 500 (Requiere confirmación).
