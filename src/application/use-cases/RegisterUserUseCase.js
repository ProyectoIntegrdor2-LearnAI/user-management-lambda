/**
 * Register User Use Case - Application Layer
 * Caso de uso para registro de usuarios
 */

import { User } from '../../domain/entities/User.js';
import { ValidationError } from '../../shared/errors/ValidationError.js';

export class RegisterUserUseCase {
  constructor(userRepository, passwordService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute({ identification, name, email, phone = null, password, address = null, type_user }) {
    const missing = [];
    const invalid = [];

    if (!identification) missing.push('identification');
    if (!name) missing.push('name');
    if (!email) missing.push('email');
    if (!password) missing.push('password');

    if (password && password.length < 8) {
      invalid.push({ field: 'password', rule: 'minLength', message: 'La contraseña debe tener al menos 8 caracteres' });
    }

    if (!User.validateEmail(email ?? '')) {
      invalid.push({ field: 'email', rule: 'format', message: 'El formato del email es inválido' });
    }

    if (missing.length || invalid.length) {
      throw new ValidationError('REGISTRATION_VALIDATION_FAILED', { missing, invalid });
    }

    // Verificar unicidad
    const existingEmailUser = await this.userRepository.existsByEmail(email);
    if (existingEmailUser) {
      throw new Error('EMAIL_ALREADY_EXISTS', {
        message: 'El email ya está registrado'
      });
    }

    const existingIdUser = await this.userRepository.existsByIdentification(identification);
    if (existingIdUser) {
      throw new Error('IDENTIFICATION_ALREADY_EXISTS', {
        message: 'La identificación ya está registrada'
      });
    }

    // Hash de la contraseña
    const passwordHash = await this.passwordService.hash(password);

    // Crear usuario
    const user = new User({
      identification,
      name,
      email,
  phone,
  address,
      password_hash: passwordHash,
      type_user: type_user || 'student'
    });

    // Persistir usuario
    const savedUser = await this.userRepository.save(user);

    // Retornar datos públicos
    return {
      success: true,
      message: 'Usuario registrado exitosamente',
      data: savedUser.toPublicData()
    };
  }
}