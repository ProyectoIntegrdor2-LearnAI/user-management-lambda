/**
 * Bcrypt Password Service - Infrastructure Layer
 * Servicio para hash y verificación de contraseñas usando bcrypt
 */

import bcrypt from 'bcrypt';

export class BcryptPasswordService {
  constructor(saltRounds = 12) {
    this.saltRounds = saltRounds;
  }

  /**
   * Genera hash de una contraseña
   */
  async hash(password) {
    if (!password) {
      throw new Error('Password is required for hashing');
    }

    try {
      return await bcrypt.hash(password, this.saltRounds);
    } catch (error) {
      throw new Error(`Error hashing password: ${error.message}`);
    }
  }

  /**
   * Verifica una contraseña contra su hash
   */
  async verify(password, hash) {
    if (!password || !hash) {
      throw new Error('Password and hash are required for verification');
    }

    try {
      return await bcrypt.compare(password, hash);
    } catch (error) {
      throw new Error(`Error verifying password: ${error.message}`);
    }
  }
}