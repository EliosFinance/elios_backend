import { BadRequestException, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerDocumentOptions, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './api/app.module';
import {CommandFactory} from "nest-commander";

async function bootstrap() {
    const app = await NestFactory.create(AppModule, { cors: true });

    const config = new DocumentBuilder()
        .setTitle('API Documentation of Elios')
        .setVersion('1.0')
        .addBearerAuth(
            {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
            'access-token',
        )
        .build();

    const options: SwaggerDocumentOptions = {
        operationIdFactory: (_controllerKey: string, methodKey: string) => methodKey,
    };
    const document = SwaggerModule.createDocument(app, config, options);
    document.security = [{ 'access-token': [] }];
    SwaggerModule.setup('api', app, document);
    app.useGlobalPipes(
        new ValidationPipe({
            whitelist: true, // Supprime les champs non définis dans le DTO
            forbidNonWhitelisted: true, // Empêche les champs non définis dans le DTO
            transform: true, // Transforme les types automatiquement (e.g., string en number)
            exceptionFactory: (errors) => {
                return new BadRequestException(
                    errors.map((err) =>
                        err?.constraints
                            ? Object.values(err.constraints).map((message) => ({
                                  field: err.property,
                                  message,
                              }))
                            : [{ field: err.property, message: 'Validation failed without specific constraints' }],
                    ),
                );
            },
        }),
    );
    await app.listen(3333);
}
bootstrap();
