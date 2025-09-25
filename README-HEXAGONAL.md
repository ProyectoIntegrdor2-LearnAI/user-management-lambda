# LearnIA User Management API - Hexagonal Architecture

API de gestión de usuarios desarrollada con **Arquitectura Hexagonal** (Ports & Adapters Pattern) para maximizar la separación de responsabilidades, testabilidad y mantenibilidad.

## 🏗️ Arquitectura Hexagonal

La aplicación está organizada siguiendo los principios de la arquitectura hexagonal:

### 📁 Estructura de Capas

```
src/
├── domain/                    # 🟢 CAPA DE DOMINIO
│   ├── entities/             # Entidades de negocio
│   │   ├── User.js
│   │   └── UserSession.js
│   └── repositories/         # Interfaces de repositorios
│       ├── IUserRepository.js
│       └── IUserSessionRepository.js
│
├── application/              # 🟡 CAPA DE APLICACIÓN
│   └── use-cases/           # Casos de uso
│       ├── RegisterUserUseCase.js
│       ├── LoginUserUseCase.js
│       ├── LogoutUserUseCase.js
│       ├── GetUserProfileUseCase.js
│       └── UpdateUserProfileUseCase.js
│
└── infrastructure/          # 🔵 CAPA DE INFRAESTRUCTURA
    ├── database/           # Adaptadores de BD
    │   ├── connection.js
    │   └── repositories/
    │       ├── PostgreSQLUserRepository.js
    │       └── PostgreSQLUserSessionRepository.js
    ├── services/          # Servicios técnicos
    │   ├── BcryptPasswordService.js
    │   └── JWTTokenService.js
    ├── web/              # Adaptadores web
    │   ├── controllers/
    │   ├── middleware/
    │   ├── routes/
    │   └── ExpressApplicationFactory.js
    ├── config/           # Configuración
    └── DIContainer.js    # Inyección de dependencias
```

### 🎯 Principios Aplicados

- **Inversión de dependencias**: El dominio no depende de la infraestructura
- **Separación de responsabilidades**: Cada capa tiene una función específica
- **Testabilidad**: Las dependencias se inyectan, facilitando mocks y testing
- **Flexibilidad**: Fácil intercambio de adaptadores (BD, servicios externos)

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+
- PostgreSQL 12+

### Configuración

1. **Instalar dependencias**:
```bash
npm install
```

2. **Configurar variables de entorno**:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

3. **Variables requeridas**:
```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=user_management
DB_USER=postgres
DB_PASSWORD=your_password

# JWT
JWT_SECRET=your-super-secret-key
JWT_EXPIRES_IN=24h

# Server
PORT=3000
NODE_ENV=development
```

### Ejecución

**Desarrollo**:
```bash
npm run dev
```

**Producción**:
```bash
npm start
```

## 📡 API Endpoints

### Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/auth/register` | Registro de usuario |
| POST | `/auth/login` | Inicio de sesión |
| POST | `/auth/logout` | Cierre de sesión |

### Usuarios

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/users/:id` | Obtener perfil |
| PUT | `/users/:id/profile` | Actualizar perfil |
| GET | `/users/:id/dashboard` | Dashboard del usuario |

### Sistema

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/health` | Health check |
| GET | `/info` | Información de la API |

## 🧩 Componentes Principales

### 🟢 Dominio (Domain Layer)

**Entidades**:
- `User`: Lógica de negocio del usuario
- `UserSession`: Gestión de sesiones

**Interfaces**:
- `IUserRepository`: Contrato para repositorio de usuarios
- `IUserSessionRepository`: Contrato para repositorio de sesiones

### 🟡 Aplicación (Application Layer)

**Casos de Uso**:
- `RegisterUserUseCase`: Registro con validaciones
- `LoginUserUseCase`: Autenticación y creación de sesión
- `LogoutUserUseCase`: Invalidación de sesión
- `GetUserProfileUseCase`: Obtención de perfil
- `UpdateUserProfileUseCase`: Actualización de perfil

### 🔵 Infraestructura (Infrastructure Layer)

**Adaptadores de Base de Datos**:
- `PostgreSQLUserRepository`: Implementación PostgreSQL
- `PostgreSQLUserSessionRepository`: Gestión de sesiones en PostgreSQL

**Servicios Técnicos**:
- `BcryptPasswordService`: Hash de contraseñas
- `JWTTokenService`: Gestión de tokens JWT

**Adaptadores Web**:
- `AuthWebController`: Controlador de autenticación
- `ProfileWebController`: Controlador de perfil
- Middlewares de autenticación, validación y errores

## 🔧 Inyección de Dependencias

El `DIContainer` gestiona todas las dependencias:

```javascript
// Ejemplo de inicialización
const container = new DIContainer();
await container.initialize();

const userRepository = container.get('userRepository');
const loginUseCase = container.get('loginUserUseCase');
```

## 🌐 Deployment

### AWS Lambda

La aplicación incluye soporte para AWS Lambda:

```javascript
export const lambdaHandler = async (event, context) => {
  // Inicialización automática con serverless-express
};
```

### Docker (Opcional)

```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY src ./src
EXPOSE 3000
CMD ["npm", "start"]
```

## 🧪 Testing

La arquitectura facilita el testing mediante inyección de dependencias:

```javascript
// Ejemplo de test de caso de uso
const mockUserRepository = new MockUserRepository();
const useCase = new RegisterUserUseCase(mockUserRepository, passwordService);
```

## 🔄 Beneficios de la Arquitectura Hexagonal

1. **Testabilidad**: Fácil mockeo de dependencias
2. **Mantenibilidad**: Código organizado por responsabilidades
3. **Flexibilidad**: Cambio de tecnologías sin afectar lógica de negocio
4. **Escalabilidad**: Estructura preparada para crecimiento
5. **Claridad**: Separación clara entre capas

## 🤝 Contribución

1. Fork del proyecto
2. Crear feature branch
3. Seguir principios de arquitectura hexagonal
4. Commit con mensajes descriptivos
5. Pull request

## 📄 Licencia

MIT License - Ver archivo LICENSE para más detalles.

---

🚀 **LearnIA Team** - Arquitectura Hexagonal en acción