import { Injectable } from '@nestjs/common';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
    private stripe: Stripe;

    constructor() {
        this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {});
    }

    async createCheckoutSession({
        userId,
        plan,
    }: {
        userId: number;
        plan: 'monthly' | 'annual';
    }) {
        const amount = plan === 'annual' ? 4799 : 499;

        const session = await this.stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            mode: 'payment',
            metadata: {
                userId: String(userId),
                plan,
            },
            line_items: [
                {
                    price_data: {
                        currency: 'eur',
                        product_data: {
                            name: `Abonnement ${plan === 'annual' ? 'Annuel' : 'Mensuel'}`,
                        },
                        unit_amount: amount,
                    },
                    quantity: 1,
                },
            ],
            success_url: process.env.STRIPE_SUCCESS_URL ?? 'http://localhost:5173/success',
            cancel_url: process.env.STRIPE_CANCEL_URL ?? 'http://localhost:5173/cancel',
        });

        return session;
    }
}
