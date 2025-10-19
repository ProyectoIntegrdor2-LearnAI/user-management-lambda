/**
 * LearningPath Web Controller - Infrastructure Layer
 */

export class LearningPathWebController {
  constructor({
    getUserLearningPathsUseCase,
    getLearningPathDetailUseCase,
    updateCourseProgressUseCase,
  }) {
    this.getUserLearningPathsUseCase = getUserLearningPathsUseCase;
    this.getLearningPathDetailUseCase = getLearningPathDetailUseCase;
    this.updateCourseProgressUseCase = updateCourseProgressUseCase;
  }

  async list(req, res, next) {
    try {
      const userId = String(req.user.user_id);
      const result = await this.getUserLearningPathsUseCase.execute({ user_id: userId });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async getOne(req, res, next) {
    try {
      const userId = String(req.user.user_id);
      const { pathId } = req.params;
      const result = await this.getLearningPathDetailUseCase.execute({
        user_id: userId,
        path_id: pathId,
      });
      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  async updateCourse(req, res, next) {
    try {
      const userId = String(req.user.user_id);
      const { pathId, courseId } = req.params;
      const payload = req.body ?? {};

      const result = await this.updateCourseProgressUseCase.execute({
        user_id: userId,
        path_id: pathId,
        course_id: courseId,
        status: payload.status,
        progress_percentage: payload.progress_percentage ?? payload.progressPercentage,
        time_invested_minutes: payload.time_invested_minutes ?? payload.timeInvestedMinutes,
        user_rating: payload.user_rating ?? payload.userRating,
        personal_notes: payload.personal_notes ?? payload.personalNotes,
      });

      return res.status(200).json(result);
    } catch (error) {
      return next(error);
    }
  }

  listHandler() {
    return this.list.bind(this);
  }

  getOneHandler() {
    return this.getOne.bind(this);
  }

  updateCourseHandler() {
    return this.updateCourse.bind(this);
  }
}
