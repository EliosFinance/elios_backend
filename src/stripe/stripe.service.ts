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
        plan: string;
    }) {
        let amount: number;
        let productName: string;
        switch (plan) {
            case 'lite_monthly':
                amount = 199;
                productName = 'Abonnement Lite Mensuel';
                break;
            case 'lite_annual':
                amount = 1999;
                productName = 'Abonnement Lite Annuel';
                break;
            case 'premium_monthly':
                amount = 499;
                productName = 'Abonnement Premium Mensuel';
                break;
            case 'premium_annual':
                amount = 4799;
                productName = 'Abonnement Premium Annuel';
                break;
            case 'famille_monthly':
                amount = 899;
                productName = 'Abonnement Famille Mensuel';
                break;
            case 'famille_annual':
                amount = 8999;
                productName = 'Abonnement Famille Annuel';
                break;
            default:
                throw new Error('Plan inconnu');
        }

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
                            name: productName,
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
