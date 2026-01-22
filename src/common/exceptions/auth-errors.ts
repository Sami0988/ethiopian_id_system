import { UnauthorizedError } from './app-errors';

export class InvalidCredentialsError extends UnauthorizedError {
  constructor() {
    super('Invalid credentials');
  }
}

export class AccountInactiveError extends UnauthorizedError {
  constructor(message = 'Account is not active') {
    super(message);
  }
}

export class TenantInactiveError extends UnauthorizedError {
  constructor() {
    super('Organization account is suspended');
  }
}
