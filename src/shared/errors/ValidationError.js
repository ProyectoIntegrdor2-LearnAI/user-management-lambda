export class ValidationError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = 'ValidationError';
    this.details = details;
  }

  getMissingFields() {
    if (Array.isArray(this.details)) {
      return this.details;
    }
    return this.details?.missing ?? [];
  }

  getInvalidFields() {
    if (Array.isArray(this.details)) {
      return [];
    }
    return this.details?.invalid ?? [];
  }
}
