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

    // Buscar usuario existente
    const user = await this.userRepository.findById(user_id);
    if (!user) {
      throw new Error('USER_NOT_FOUND', {
        message: 'Usuario no encontrado'
      });
    }

    // Verificar que la cuenta esté activa
    if (!user.isActive()) {
      throw new Error('ACCOUNT_SUSPENDED', {
        message: 'La cuenta está suspendida'
      });
    }

    const sanitizedUpdates = { ...updates };

    // Si se está actualizando el email, verificar que no exista
    if (sanitizedUpdates.email && sanitizedUpdates.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(sanitizedUpdates.email);
      if (existingUser) {
        throw new Error('EMAIL_EXISTS', {
          message: 'El email ya está registrado'
        });
      }
    }

    // Si se está actualizando la contraseña, hashearla
    if (sanitizedUpdates.password) {
      sanitizedUpdates.password_hash = await this.passwordService.hash(sanitizedUpdates.password);
      delete sanitizedUpdates.password; // No almacenar la contraseña en texto plano
    }

    try {
      // Actualizar usuario usando los métodos del dominio
      if (sanitizedUpdates.name) user.updateName(sanitizedUpdates.name);
      if (sanitizedUpdates.email) user.updateEmail(sanitizedUpdates.email);
      if (sanitizedUpdates.password_hash) user.updatePasswordHash(sanitizedUpdates.password_hash);
      if (sanitizedUpdates.phone !== undefined) user.updatePhone(sanitizedUpdates.phone);
      if (sanitizedUpdates.address !== undefined) user.updateAddress(sanitizedUpdates.address);

      // Guardar en el repositorio
      const updatedUser = await this.userRepository.update(user);

      return {
        success: true,
        message: 'Perfil actualizado exitosamente',
        data: {
          user: updatedUser.toPublicData()
        }
      };

    } catch (error) {
      if (error.code) {
        throw error;
      }

      throw new Error('UPDATE_ERROR', {
        message: 'Error al actualizar el perfil',
        details: error.message
      });
    }
  }
}