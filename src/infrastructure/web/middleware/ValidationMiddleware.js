/**
 * Validation Middleware - Infrastructure Layer
 * Middleware para validación de datos de entrada
 */

import { ValidationError } from '../../../shared/errors/ValidationError.js';

const REQUIRED_FIELDS = [
  'identification',
  'name',
  'email',
  'password'
];

const OPTIONAL_FIELDS = [
  'phone',
  'address'
];

export class ValidationMiddleware {
  
  /**
   * Middleware genérico de validación usando esquemas
   */
  static validate(schema) {
    return (req, res, next) => {
      const { error } = schema.validate(req.body);
      
      if (error) {
        return res.status(400).json({
          success: false,
          message: 'Datos inválidos',
          errors: error.details.map(detail => detail.message)
        });
      }
      
      next();
    };
  }

  /**
   * Validación específica para registro de usuario
   */
  static validateRegistration() {
    return (req, res, next) => {
      const normalizedBody = { ...req.body };
      const missing = [];

      const name = typeof normalizedBody.name === 'string' ? normalizedBody.name.trim() : normalizedBody.name;
      const email = typeof normalizedBody.email === 'string' ? normalizedBody.email.trim() : normalizedBody.email;
      const password = normalizedBody.password;
      const identification = normalizedBody.identification?.toString().trim();
      const type_user = normalizedBody.type_user;

      REQUIRED_FIELDS.forEach(field => {
        const value = field === 'name' ? name : field === 'email' ? email : field === 'identification' ? identification : normalizedBody[field];

        if (!value || (typeof value === 'string' && value.trim().length === 0)) {
          missing.push(field);
        }
      });

      if (name && name.length < 2 && !missing.includes('name')) {
        missing.push('name');
      }

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          missing.push('email');
        }
      }

      if (password && password.length < 6 && !missing.includes('password')) {
        missing.push('password');
      }

      if (missing.length > 0) {
        return next(new ValidationError('MISSING_REQUIRED_FIELDS', missing));
      }

      const optionalSanitized = OPTIONAL_FIELDS.reduce((acc, field) => {
        const value = normalizedBody[field];
        acc[field] = value ?? null;
        return acc;
      }, {});

      req.validated = {
        ...(req.validated || {}),
        body: {
          name,
          email,
          password,
          identification,
          ...optionalSanitized,
          type_user: type_user ?? 'user'
        }
      };

      next();
    };
  }

  /**
   * Validación específica para login
   */
  static validateLogin() {
    return (req, res, next) => {
      const { email, password } = req.body;
      const errors = [];

      if (!email) {
        errors.push('Email es obligatorio');
      }

      if (!password) {
        errors.push('Contraseña es obligatoria');
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Datos de login inválidos',
          errors
        });
      }

      next();
    };
  }

  /**
   * Validación para actualización de perfil
   */
  static validateProfileUpdate() {
    return (req, res, next) => {
      const { name, email, password, phone } = req.body;
      const errors = [];

      // Validar nombre si se proporciona
      if (name !== undefined && (!name || name.trim().length < 2)) {
        errors.push('El nombre debe tener al menos 2 caracteres');
      }

      // Validar email si se proporciona
      if (email !== undefined) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email || !emailRegex.test(email)) {
          errors.push('El email debe tener un formato válido');
        }
      }

      // Validar contraseña si se proporciona
      if (password !== undefined && password.length < 6) {
        errors.push('La contraseña debe tener al menos 6 caracteres');
      }

      // Validar teléfono si se proporciona
      if (phone !== undefined && phone !== null && phone !== '') {
        const phoneRegex = /^[+]?[\d\s\-\(\)]{10,}$/;
        if (!phoneRegex.test(phone)) {
          errors.push('El teléfono debe tener un formato válido');
        }
      }

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Datos de actualización inválidos',
          errors
        });
      }

      next();
    };
  }
}