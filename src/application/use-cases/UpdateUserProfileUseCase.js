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

    // Si se está actualizando el email, verificar que no exista
    if (updates.email && updates.email !== user.email) {
      const existingUser = await this.userRepository.findByEmail(updates.email);
      if (existingUser) {
        throw new Error('EMAIL_EXISTS', {
          message: 'El email ya está registrado'
        });
      }
    }

    // Si se está actualizando la contraseña, hashearla
    if (updates.password) {
      updates.password_hash = await this.passwordService.hash(updates.password);
      delete updates.password; // No almacenar la contraseña en texto plano
    }

    try {
      // Actualizar usuario usando los métodos del dominio
      if (updates.name) user.updateName(updates.name);
      if (updates.email) user.updateEmail(updates.email);
      if (updates.password_hash) user.updatePasswordHash(updates.password_hash);
      if (updates.phone !== undefined) user.updatePhone(updates.phone);

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