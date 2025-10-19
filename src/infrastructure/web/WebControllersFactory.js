/**
 * Web Controllers Factory - Infrastructure Layer
 * Factory para instanciar controladores web con sus dependencias
 */

export class WebControllersFactory {
  constructor({
    // Use Cases
    registerUserUseCase,
    loginUserUseCase,
    logoutUserUseCase,
    getUserProfileUseCase,
    updateUserProfileUseCase,
    getUserLearningProgressUseCase,
  }) {
    this.registerUserUseCase = registerUserUseCase;
    this.loginUserUseCase = loginUserUseCase;
    this.logoutUserUseCase = logoutUserUseCase;
    this.getUserProfileUseCase = getUserProfileUseCase;
    this.updateUserProfileUseCase = updateUserProfileUseCase;
    this.getUserLearningProgressUseCase = getUserLearningProgressUseCase;
  }

  createAuthWebController() {
    const { AuthWebController } = require('./controllers/AuthWebController.js');
    
    return new AuthWebController(
      this.registerUserUseCase,
      this.loginUserUseCase,
      this.logoutUserUseCase
    );
  }

  createProfileWebController() {
    const { ProfileWebController } = require('./controllers/ProfileWebController.js');
    
    return new ProfileWebController(
      this.getUserProfileUseCase,
      this.updateUserProfileUseCase,
      this.getUserLearningProgressUseCase
    );
  }
}
