/**
 * UserSession Entity - Domain Layer
 * Representa una sesión de usuario en el sistema
 */

import { v4 as uuidv4 } from 'uuid';

export class UserSession {
  constructor({
    session_id,
    user_id,
    jwt_token_hash,
    created_at,
    expires_at,
    is_active = true
  }) {
    this.session_id = session_id || uuidv4();
    this.user_id = user_id;
    this.jwt_token_hash = jwt_token_hash;
    this.created_at = created_at || new Date();
    this.expires_at = expires_at;
    this.is_active = is_active;
  }

  // Métodos de negocio
  isExpired() {
    return new Date() > this.expires_at;
  }

  isValid() {
    return this.is_active && !this.isExpired();
  }

  isActive() {
    return this.isValid();
  }

  invalidate() {
    this.is_active = false;
  }

  extend(additionalHours = 24) {
    const newExpiration = new Date(this.expires_at);
    newExpiration.setHours(newExpiration.getHours() + additionalHours);
    this.expires_at = newExpiration;
  }

  // Factory method para crear sesión con duración específica
  static createWithDuration(user_id, jwt_token_hash, durationHours = 24) {
    const expires_at = new Date();
    expires_at.setHours(expires_at.getHours() + durationHours);
    
    return new UserSession({
      user_id,
      jwt_token_hash,
      expires_at
    });
  }

  // Validaciones
  static parseDuration(duration = '24h') {
    if (typeof duration === 'string' && duration.includes('h')) {
      return Number.parseInt(duration.replace('h', ''));
    }
    return typeof duration === 'number' ? duration : 24;
  }
}
