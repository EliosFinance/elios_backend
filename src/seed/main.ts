import { seedArticles } from './seed-articles';
import { seedChallenges } from './seed-challenges';
import { seedEnterprises } from './seed-enterprises';
import { seedQuizz } from './seed-quizz';

async function main() {
    try {
        await seedEnterprises();
        await seedChallenges();
        await seedArticles();
        await seedQuizz();
    } catch (error) {
        console.error(error);
    }
}

main();
