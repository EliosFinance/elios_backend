import { Injectable } from '@nestjs/common';
import { EmailService } from '@src/api/emails/services/email.service';
import { DefaultTemplatesSeeder } from '@src/api/emails/templates/default-templates';
import { Command, CommandRunner } from 'nest-commander';

@Injectable()
@Command({
    name: 'seed:email-templates',
    description: 'Seed default email templates',
})
export class SeedEmailTemplatesCommand extends CommandRunner {
    constructor(private readonly emailService: EmailService) {
        super();
    }

    async run(): Promise<void> {
        console.log('🌱 Insertion des templates email par défaut...');

        const seeder = new DefaultTemplatesSeeder(this.emailService);
        await seeder.seedDefaultTemplates();

        console.log('✅ Templates email insérés avec succès!');
    }
}
