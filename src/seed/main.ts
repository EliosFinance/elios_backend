import { seedArticles } from './seed-articles';
import { seedChallenges } from './seed-challenges';
import { seedEnterprises } from './seed-enterprises';

async function main() {
    try {
        await seedEnterprises();
        await seedArticles();
        await seedChallenges();
    } catch (error) {
        console.error(error);
    }
}

main();
