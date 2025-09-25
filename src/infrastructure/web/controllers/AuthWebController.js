/**
 * Auth Web Controller - Infrastructure Layer
 * Controlador web para manejar requests HTTP de autenticación
 */

export class AuthWebController {
  constructor(
    registerUserUseCase,
    loginUserUseCase,
    logoutUserUseCase
  ) {
    this.registerUserUseCase = registerUserUseCase;
    this.loginUserUseCase = loginUserUseCase;
    this.logoutUserUseCase = logoutUserUseCase;
  }

  /**
   * Maneja el registro de nuevos usuarios
   */
  async register(req, res, next) {
    try {
      const { name, email, password, phone, type_user } = req.body;
      
      const result = await this.registerUserUseCase.execute({
        name,
        email,
        password,
        phone: phone || null,
        type_user: type_user || 'user'
      });

      return res.status(201).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja el login de usuarios
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;
      
      const result = await this.loginUserUseCase.execute({
        email,
        password
      });

      return res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Maneja el logout de usuarios
   */
  async logout(req, res, next) {
    try {
      // El token y user_id vienen del middleware de autenticación
      const token = req.headers.authorization?.split(' ')[1];
      const { user_id } = req.user;
      
      const result = await this.logoutUserUseCase.execute({
        token,
        user_id
      });

      return res.status(200).json(result);

    } catch (error) {
      next(error);
    }
  }

  /**
   * Métodos bound para usar directamente en las rutas
   */
  getRegisterHandler() {
    return this.register.bind(this);
  }

  getLoginHandler() {
    return this.login.bind(this);
  }

  getLogoutHandler() {
    return this.logout.bind(this);
  }
}