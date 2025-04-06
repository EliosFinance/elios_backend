// import { NestFactory } from "@nestjs/core";
// import { AppModule } from "@src/api/app.module";
// import { ChallengeWorker } from "./ChallengeWorker";

// export async function initBootstrap() {
//     console.log('🚀 Initialisation des workers...');

//     try {

//         app.get(ChallengeWorker);
//         console.log('✅ ChallengeWorker initialisé');

//     } catch (error) {
//         console.error('❌ Erreur lors de l\'initialisation des workers :', error);
//         process.exit(1);
//     }

//     // Empêcher l'arrêt du processus
//     process.on('SIGINT', () => {
//         console.log('🛑 Fermeture des workers...');
//         process.exit();
//     });

//     process.on('unhandledRejection', (reason, promise) => {
//         console.error('⚠️ Rejection non gérée :', reason);
//     });

//     process.on('uncaughtException', (error) => {
//         console.error('🔥 Exception fatale :', error);
//         process.exit(1);
//     });
// }

// initBootstrap();
