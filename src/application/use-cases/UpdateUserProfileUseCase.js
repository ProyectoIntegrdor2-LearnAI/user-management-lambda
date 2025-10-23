/**
 * Update User Profile Use Case - Application Layer
 * Caso de uso para actualizar perfil de usuario
 */

export class UpdateUserProfileUseCase {
  constructor(userRepository, passwordService) {
    this.userRepository = userRepository;
    this.passwordService = passwordService;
  }

  async execute({ user_id, updates }) {
    this._validateInput(user_id, updates);

    const user = await this._getActiveUser(user_id);
    const sanitizedUpdates = await this._sanitizeUpdates(updates, user);

    return this._updateUser(user, sanitizedUpdates);
  }

  _validateInput(user_id, updates) {
    if (!user_id) {
      throw new Error('MISSING_USER_ID', {
        message: 'ID de usuario es obligatorio'
      });
    }

    if (!updates || Object.keys(updates).length === 0) {
      throw new Error('NO_UPDATES', {
        message: 'No se proporcionaron datos para actualizar'
      });
    }
  }

  async _getActiveUser(user_id) {
    const user = await this.userRepository.findById(user_id);
    if (!user) {
      throw new Error('USER_NOT_FOUND', {
        message: 'Usuario no encontrado'
      });
    }

    if (!user.isActive()) {
      throw new Error('ACCOUNT_SUSPENDED', {
        message: 'La cuenta está suspendida'
      });
    }

    return user;
  }

  async _sanitizeUpdates(updates, user) {
    const sanitized = { ...updates };

    if (sanitized.email && sanitized.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(sanitized.email);
      if (existingUser) {
        throw new Error('EMAIL_EXISTS', {
          message: 'El email ya está registrado'
        });
      }
    }

    if (sanitized.password) {
      sanitized.password_hash = await this.passwordService.hash(sanitized.password);
      delete sanitized.password;
    }

    return sanitized;
  }

  async _updateUser(user, updates) {
    try {
      this._applyDomainUpdates(user, updates);
      const updatedUser = await this.userRepository.update(user);

      return {
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: { user: updatedUser.toPublicData() }
      };

    } catch (error) {
      if (error.code) throw error;
      throw new Error('UPDATE_ERROR', {
        message: 'Error al actualizar el perfil',
        details: error.message
      });
    }
  }

  _applyDomainUpdates(user, updates) {
    if (updates.name) user.updateName(updates.name);
    if (updates.email) user.updateEmail(updates.email);
    if (updates.password_hash) user.updatePasswordHash(updates.password_hash);
    if (updates.phone !== undefined) user.updatePhone(updates.phone);
    if (updates.address !== undefined) user.updateAddress(updates.address);
  }
}
