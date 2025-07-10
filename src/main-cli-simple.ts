import { NestFactory } from '@nestjs/core';
import { AppModule } from './api/app.module';
import { EmailService } from './api/emails/services/email.service';
import { DefaultTemplatesSeeder } from './api/emails/templates/default-templates';
import { config } from 'dotenv';

// Charger les variables d'environnement
config();

async function seedEmailTemplates() {
    console.log('🚀 Démarrage du seeding des templates email...');

    try {
        // Créer le contexte d'application NestJS avec l'AppModule existant
        const app = await NestFactory.createApplicationContext(AppModule, {
            logger: ['error', 'warn', 'log']
        });

        console.log('✅ Connexion à la base de données réussie');

        // Obtenir le service email
        const emailService = app.get(EmailService);
        console.log('✅ Service email récupéré');

        // Créer et exécuter le seeder
        const seeder = new DefaultTemplatesSeeder(emailService);
        await seeder.seedDefaultTemplates();

        console.log('✅ Seeding terminé avec succès!');

        // Fermer l'application
        await app.close();
        process.exit(0);

    } catch (error) {
        console.error('❌ Erreur lors du seeding:', error.message);
        console.error(error.stack);
        process.exit(1);
    }
}

// Exécuter le seeding
seedEmailTemplates();
