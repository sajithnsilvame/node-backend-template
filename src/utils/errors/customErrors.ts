export class UnauthorizedError extends Error {
  statusCode: number;

  constructor(message: string = "Unauthorized") {
    super(message);
    this.name = "UnauthorizedError";
    this.statusCode = 401;
    
    // Ensure the error prototype is set correctly (for instanceof checks)
    Object.setPrototypeOf(this, UnauthorizedError.prototype);
  }
}
