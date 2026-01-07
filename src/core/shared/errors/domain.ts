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

export class PermissionError extends Error {
  constructor(
    message: string,
    public permission: string,
    public code: string = "PERMISSION_DENIED"
  ) {
    super(message);
    this.name = "PermissionError";
    Object.setPrototypeOf(this, PermissionError.prototype);
  }
}
