import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { IS_PIN_SETUP_ROUTE } from '@src/api/auth/decorator/pin-setup.decorator';
import { IS_PUBLIC_KEY } from '@src/api/auth/decorator/public.decorator';
import { PinAuthService } from '@src/api/auth/services/pin-auth.service';

@Injectable()
export class PinConfiguredGuard implements CanActivate {
    constructor(
        private readonly reflector: Reflector,
        private readonly pinAuthService: PinAuthService,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        const isPinSetupRoute = this.reflector.getAllAndOverride<boolean>(IS_PIN_SETUP_ROUTE, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic || isPinSetupRoute) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user || !user.id) {
            throw new UnauthorizedException('Utilisateur non authentifié');
        }

        const isPinSetup = await this.pinAuthService.isPinSetup(user.id);
        if (!isPinSetup) {
            throw new UnauthorizedException('Configuration du PIN requise');
        }

        return true;
    }
}
