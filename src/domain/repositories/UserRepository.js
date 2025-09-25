/**
 * UserRepository Interface - Domain Layer
 * Define el contrato para persistencia de usuarios (Puerto de salida)
 */

export class UserRepository {
  // Métodos de consulta
  async findById(user_id) {
    throw new Error('Method must be implemented');
  }

  async findByEmail(email) {
    throw new Error('Method must be implemented');
  }

  async findByIdentification(identification) {
    throw new Error('Method must be implemented');
  }

  // Métodos de persistencia
  async save(user) {
    throw new Error('Method must be implemented');
  }

  async update(user) {
    throw new Error('Method must be implemented');
  }

  async delete(user_id) {
    throw new Error('Method must be implemented');
  }

  // Métodos de validación
  async existsByEmail(email) {
    throw new Error('Method must be implemented');
  }

  async existsByIdentification(identification) {
    throw new Error('Method must be implemented');
  }

  // Métodos específicos de negocio
  async updateLastLogin(user_id) {
    throw new Error('Method must be implemented');
  }

  async updateProfile(user_id, profileData) {
    throw new Error('Method must be implemented');
  }
}