/**
 * JWT Token Service - Infrastructure Layer
 * Servicio para generación y verificación de tokens JWT
 */

import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

export class JWTTokenService {
  constructor(secretKey, options = {}) {
    if (!secretKey) {
      throw new Error('JWT secret key is required');
    }
    
    this.secretKey = secretKey;
    this.defaultOptions = {
      expiresIn: '24h',
      algorithm: 'HS256',
      ...options
    };
  }

  /**
   * Genera un token JWT
   */
  async generate(payload, options = {}) {
    if (!payload || typeof payload !== 'object') {
      throw new Error('Payload must be a valid object');
    }

    try {
      const tokenOptions = { ...this.defaultOptions, ...options };
      return jwt.sign(payload, this.secretKey, tokenOptions);
    } catch (error) {
      throw new Error(`Error generating JWT token: ${error.message}`);
    }
  }

  /**
   * Verifica un token JWT
   */
  async verify(token, options = {}) {
    if (!token) {
      throw new Error('Token is required for verification');
    }

    try {
      const verifyOptions = { ...options };
      return jwt.verify(token, this.secretKey, verifyOptions);
    } catch (error) {
      if (error.name === 'JsonWebTokenError') {
        const invalidTokenError = new Error('Token inválido');
        invalidTokenError.name = 'JsonWebTokenError';
        throw invalidTokenError;
      }
      if (error.name === 'TokenExpiredError') {
        const expiredTokenError = new Error('Token expirado');
        expiredTokenError.name = 'TokenExpiredError';
        throw expiredTokenError;
      }
      throw error;
    }
  }

  /**
   * Genera hash SHA256 de un token (para almacenar en BD)
   */
  async hash(token) {
    if (!token) {
      throw new Error('Token is required for hashing');
    }

    return crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');
  }

  /**
   * Decodifica un token sin verificarlo (útil para debugging)
   */
  decode(token) {
    if (!token) {
      throw new Error('Token is required for decoding');
    }

    return jwt.decode(token);
  }
}