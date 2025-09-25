/**
 * Login User Use Case - Application Layer
 * Caso de uso para autenticación de usuarios
 */

import { UserSession } from '../../domain/entities/UserSession.js';

export class LoginUserUseCase {
  constructor(userRepository, userSessionRepository, passwordService, tokenService) {
    this.userRepository = userRepository;
    this.userSessionRepository = userSessionRepository;
    this.passwordService = passwordService;
    this.tokenService = tokenService;
  }

  async execute({ email, password }) {
    // Validaciones básicas
    if (!email || !password) {
      throw new Error('MISSING_CREDENTIALS', {
        message: 'Email y contraseña son obligatorios'
      });
    }

    // Buscar usuario
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('INVALID_CREDENTIALS', {
        message: 'Credenciales inválidas'
      });
    }

    // Verificar que la cuenta esté activa
    if (!user.isActive()) {
      throw new Error('ACCOUNT_SUSPENDED', {
        message: 'La cuenta está suspendida'
      });
    }

    // Verificar contraseña
    const isValidPassword = await this.passwordService.verify(password, user.password_hash);
    if (!isValidPassword) {
      throw new Error('INVALID_CREDENTIALS', {
        message: 'Credenciales inválidas'
      });
    }

    // Generar token JWT
    const tokenPayload = {
      user_id: user.user_id,
      email: user.email,
      type_user: user.type_user
    };

    const token = await this.tokenService.generate(tokenPayload);
    const tokenHash = await this.tokenService.hash(token);

    // Crear sesión
    const userSession = UserSession.createWithDuration(
      user.user_id,
      tokenHash,
      24 // 24 horas por defecto
    );

    const savedSession = await this.userSessionRepository.save(userSession);

    // Actualizar último login
    await this.userRepository.updateLastLogin(user.user_id);

    return {
      success: true,
      message: 'Login exitoso',
      data: {
        user: user.toPublicData(),
        token,
        session_id: savedSession.session_id,
        expires_at: savedSession.expires_at
      }
    };
  }
}