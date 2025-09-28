/**
 * UserSessionRepository Interface - Domain Layer
 * Define el contrato para persistencia de sesiones (Puerto de salida)
 */

export class UserSessionRepository {
  // Métodos de consulta
  async findByTokenHash(jwt_token_hash) {
    throw new Error('Method must be implemented');
  }

  async findActiveByTokenHash(jwt_token_hash) {
    throw new Error('Method must be implemented');
  }

  async findByUserIdAndTokenHash(user_id, jwt_token_hash) {
    throw new Error('Method must be implemented');
  }

  async findActiveSessionsByUserId(user_id) {
    throw new Error('Method must be implemented');
  }

  // Métodos de persistencia
  async save(userSession) {
    throw new Error('Method must be implemented');
  }

  async update(userSession) {
    throw new Error('Method must be implemented');
  }

  // Métodos de gestión de sesiones
  async invalidateByTokenHash(jwt_token_hash) {
    throw new Error('Method must be implemented');
  }

  async invalidateAllByUserId(user_id) {
    throw new Error('Method must be implemented');
  }

  async cleanExpiredSessions() {
    throw new Error('Method must be implemented');
  }

  // Métodos de validación
  async validateSession(jwt_token_hash) {
    throw new Error('Method must be implemented');
  }

  async countActiveSessionsByUserId(user_id) {
    throw new Error('Method must be implemented');
  }
}
