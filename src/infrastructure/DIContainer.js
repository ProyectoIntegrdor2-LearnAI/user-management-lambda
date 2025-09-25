/**
 * Dependency Injection Container - Infrastructure Layer
 * Contenedor de inyección de dependencias para la arquitectura hexagonal
 */

// Domain
import { User } from '../domain/entities/User.js';
import { UserSession } from '../domain/entities/UserSession.js';

// Application Use Cases
import { RegisterUserUseCase } from '../application/use-cases/RegisterUserUseCase.js';
import { LoginUserUseCase } from '../application/use-cases/LoginUserUseCase.js';
import { LogoutUserUseCase } from '../application/use-cases/LogoutUserUseCase.js';
import { GetUserProfileUseCase } from '../application/use-cases/GetUserProfileUseCase.js';
import { UpdateUserProfileUseCase } from '../application/use-cases/UpdateUserProfileUseCase.js';

// Infrastructure
import dbPool from './database/connection.js';
import { PostgreSQLUserRepository } from './persistence/PostgreSQLUserRepository.js';
import { PostgreSQLUserSessionRepository } from './persistence/PostgreSQLUserSessionRepository.js';

// Services
import { BcryptPasswordService } from './services/BcryptPasswordService.js';
import { JWTTokenService } from './services/JWTTokenService.js';

// Web Layer
import {
  AuthWebController,
  ProfileWebController,
  AuthenticationMiddleware,
  ValidationMiddleware,
  ErrorHandlerMiddleware,
  RequestLoggerMiddleware
} from './web/index.js';

export class DIContainer {
  constructor() {
    this._services = new Map();
    this._initialized = false;
  }

  async initialize() {
    if (this._initialized) return;

    try {
  // Register database pool (connection is managed internally)
  this._services.set('dbPool', dbPool);

  // Initialize repositories
  const userRepository = new PostgreSQLUserRepository();
  const userSessionRepository = new PostgreSQLUserSessionRepository();
      this._services.set('userRepository', userRepository);
      this._services.set('userSessionRepository', userSessionRepository);

      // Initialize services
      const passwordService = new BcryptPasswordService();
      const tokenService = new JWTTokenService(process.env.JWT_SECRET);
      this._services.set('passwordService', passwordService);
      this._services.set('tokenService', tokenService);

      // Initialize use cases
      const registerUserUseCase = new RegisterUserUseCase(
        userRepository,
        passwordService
      );

      const loginUserUseCase = new LoginUserUseCase(
        userRepository,
        userSessionRepository,
        passwordService,
        tokenService
      );

      const logoutUserUseCase = new LogoutUserUseCase(
        userSessionRepository,
        tokenService
      );

      const getUserProfileUseCase = new GetUserProfileUseCase(
        userRepository
      );

      const updateUserProfileUseCase = new UpdateUserProfileUseCase(
        userRepository,
        passwordService
      );

      this._services.set('registerUserUseCase', registerUserUseCase);
      this._services.set('loginUserUseCase', loginUserUseCase);
      this._services.set('logoutUserUseCase', logoutUserUseCase);
      this._services.set('getUserProfileUseCase', getUserProfileUseCase);
      this._services.set('updateUserProfileUseCase', updateUserProfileUseCase);

      // Initialize web controllers
      const authWebController = new AuthWebController(
        registerUserUseCase,
        loginUserUseCase,
        logoutUserUseCase
      );

      const profileWebController = new ProfileWebController(
        getUserProfileUseCase,
        updateUserProfileUseCase
      );

      this._services.set('authWebController', authWebController);
      this._services.set('profileWebController', profileWebController);

      // Initialize middlewares
      const authenticationMiddleware = new AuthenticationMiddleware(
        tokenService,
        userSessionRepository
      );

      this._services.set('authenticationMiddleware', authenticationMiddleware);
      this._services.set('validationMiddleware', ValidationMiddleware);
      this._services.set('errorHandlerMiddleware', ErrorHandlerMiddleware);
      this._services.set('requestLoggerMiddleware', RequestLoggerMiddleware);

      this._initialized = true;
      console.log('✅ DI Container initialized successfully');

    } catch (error) {
      console.error('❌ Error initializing DI Container:', error);
      throw error;
    }
  }

  get(serviceName) {
    if (!this._initialized) {
      throw new Error('DI Container not initialized. Call initialize() first.');
    }

    const service = this._services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found in DI Container`);
    }

    return service;
  }

  async cleanup() {
    try {
      const pool = this._services.get('dbPool');
      if (pool && typeof pool.end === 'function' && !pool.ended) {
        await pool.end();
      }
      console.log('✅ DI Container cleanup completed');
    } catch (error) {
      console.error('❌ Error during cleanup:', error);
    }
  }
}