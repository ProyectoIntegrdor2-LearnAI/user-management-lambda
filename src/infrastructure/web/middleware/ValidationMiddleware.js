/**
 * Validation Middleware - Infrastructure Layer
 * Middleware para validación de datos de entrada
 */

import { ValidationError } from '../../../shared/errors/ValidationError.js';

const OPTIONAL_FIELDS = ['phone', 'address'];

/* ============================================================
 * FUNCIONES AUXILIARES (scope superior)
 * ============================================================ */

function validateName(name, errors, sanitized) {
  if (name === undefined) return;
  const trimmed = typeof name === 'string' ? name.trim() : name;
  if (!trimmed || trimmed.length < 2) {
    errors.push('El nombre debe tener al menos 2 caracteres');
  } else {
    sanitized.name = trimmed;
  }
}

function validateEmail(email, errors, sanitized) {
  if (email === undefined) return;
  const trimmed = typeof email === 'string' ? email.trim() : email;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!trimmed || !emailRegex.test(trimmed)) {
    errors.push('El email debe tener un formato válido');
  } else {
    sanitized.email = trimmed;
  }
}

function validatePassword(password, errors, sanitized) {
  if (password === undefined) return;
  if (!password || password.length < 8) {
    errors.push('La contraseña debe tener al menos 8 caracteres');
  } else {
    sanitized.password = password;
  }
}

function validatePhone(phone, errors, sanitized) {
  if (phone === undefined) return;
  if (phone === null || phone === '') {
    sanitized.phone = null;
  } else {
    // ✅ Regex sin escapes innecesarios
    const phoneRegex = /^[+]?[\d\s\-()]{10,}$/;
    if (phoneRegex.test(phone)) {
      sanitized.phone = phone;
      return;
    }

    errors.push('El teléfono debe tener un formato válido');

  }
}

function validateAddress(address, errors, sanitized) {
  if (address === undefined) return;
  if (address === null || address === '') {
    sanitized.address = null;
  } else if (typeof address === 'string') {
    sanitized.address = address.trim();
  } else {
    sanitized.address = address;
  }
}

/* ============================================================
 * CLASE PRINCIPAL
 * ============================================================ */

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
      const invalid = [];

      const rawName = normalizedBody.name;
      const rawEmail = normalizedBody.email;
      const rawPassword = normalizedBody.password;
      const rawIdentification = normalizedBody.identification;
      const type_user = normalizedBody.type_user;

      const name = typeof rawName === 'string' ? rawName.trim() : rawName;
      const email = typeof rawEmail === 'string' ? rawEmail.trim() : rawEmail;
      const identification = rawIdentification?.toString().trim();
      const password = rawPassword;

      if (!identification) missing.push('identification');

      if (!name) {
        missing.push('name');
      } else if (name.length < 2) {
        invalid.push({
          field: 'name',
          rule: 'minLength',
          message: 'El nombre debe tener al menos 2 caracteres'
        });
      }

      if (email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
          invalid.push({
            field: 'email',
            rule: 'format',
            message: 'El email debe tener un formato válido'
          });
        }
      } else {
        missing.push('email');
      }

      if (!password) {
        missing.push('password');
      } else if (password.length < 8) {
        invalid.push({
          field: 'password',
          rule: 'minLength',
          message: 'La contraseña debe tener al menos 8 caracteres'
        });
      }

      if (missing.length > 0 || invalid.length > 0) {
        return next(new ValidationError('REGISTRATION_VALIDATION_FAILED', { missing, invalid }));
      }

      const optionalSanitized = OPTIONAL_FIELDS.reduce((acc, field) => {
        const value = normalizedBody[field];
        if (typeof value === 'string') {
          const trimmed = value.trim();
          acc[field] = trimmed.length > 0 ? trimmed : null;
        } else {
          acc[field] = value ?? null;
        }
        return acc;
      }, {});

      req.validated = {
        ...req.validated,
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

      if (!email) errors.push('Email es obligatorio');
      if (!password) errors.push('Contraseña es obligatoria');

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
      const { name, email, password, phone, address } = req.body;
      const errors = [];
      const sanitized = {};

      validateName(name, errors, sanitized);
      validateEmail(email, errors, sanitized);
      validatePassword(password, errors, sanitized);
      validatePhone(phone, errors, sanitized);
      validateAddress(address, errors, sanitized);

      if (errors.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'Datos de actualización inválidos',
          errors
        });
      }

      if (Object.keys(sanitized).length > 0) {
        req.validated = {
          ...req.validated,
          body: sanitized
        };
      }

      next();
    };
  }
}
