import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
    constructor(private readonly stripeService: StripeService) {}

    @UseGuards(AuthGuard('jwt'))
    @Post('create-checkout-session')
    async createCheckout(@Req() req, @Body('plan') plan: 'monthly' | 'annual') {
        const userId = req.user.id;

        const session = await this.stripeService.createCheckoutSession({
            userId,
            plan,
        });

        return {
            sessionId: session.id,
            url: session.url,
        };
    }
}
