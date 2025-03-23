import { seedArticles } from './seed-articles';
import { seedChallenges } from './seed-challenges';
import { seedEnterprises } from './seed-enterprises';

async function main() {
    try {
        await seedChallenges();
        await seedEnterprises();
        await seedArticles();
    } catch (error) {
        console.error(error);
    }
}

main();
