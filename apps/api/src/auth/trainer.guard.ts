import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import type { JwtPayload } from './jwt.strategy';

/** Ensures the request is from a trainer or admin (e.g. for trainer-only chat). */
@Injectable()
export class TrainerGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<{ user?: JwtPayload }>();
    const user = request.user;
    if (!user || (user.role !== 'trainer' && user.role !== 'admin')) {
      throw new ForbiddenException('Trainer access required');
    }
    return true;
  }
}
