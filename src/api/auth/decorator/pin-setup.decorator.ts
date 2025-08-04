import { SetMetadata } from '@nestjs/common';

export const IS_PIN_SETUP_ROUTE = 'isPinSetupRoute';
export const PinSetupRoute = () => SetMetadata(IS_PIN_SETUP_ROUTE, true);
