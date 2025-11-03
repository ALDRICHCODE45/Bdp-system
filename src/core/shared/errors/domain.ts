export class DomainError extends Error {
  code: string;
  constructor(code: string, message?: string) {
    super(message ?? code);
    this.code = code;
  }
}

export class ConflictError extends DomainError {
  constructor(code = "CONFLICT", message?: string) {
    super(code, message);
  }
}

export class ValidationError extends DomainError {
  constructor(code = "VALIDATION_ERROR", message?: string) {
    super(code, message);
  }
}
