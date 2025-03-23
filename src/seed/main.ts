import { seedChallenges } from './seed-challenges';
import { seedEnterprises } from './seed-enterprises';

async function main() {
    try {
        await seedEnterprises();
        await seedChallenges();
    } catch (error) {
        console.error(error);
    }
}

main();
