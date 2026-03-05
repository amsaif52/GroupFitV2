import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AdminGuard } from './admin.guard';

describe('AdminGuard', () => {
  const guard = new AdminGuard();

  const createMockContext = (user: { role?: string } | undefined) =>
    ({
      switchToHttp: () => ({
        getRequest: () => ({ user }),
      }),
    }) as unknown as ExecutionContext;

  it('allows when user.role is admin', () => {
    const ctx = createMockContext({ role: 'admin' });
    expect(guard.canActivate(ctx)).toBe(true);
  });

  it('throws ForbiddenException when user is missing', () => {
    const ctx = createMockContext(undefined);
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
    expect(() => guard.canActivate(ctx)).toThrow('Admin access required');
  });

  it('throws ForbiddenException when user.role is not admin', () => {
    const ctx = createMockContext({ role: 'customer' });
    expect(() => guard.canActivate(ctx)).toThrow(ForbiddenException);
  });
});
