import { PrismaClient } from '@prisma/client';
import { seedAdmin } from './seedAdmin';

const prisma = new PrismaClient();

async function seed(){
    // Seed Function Call Goes Here
    await seedAdmin(prisma)
}

seed()
    .then(() => {
        console.log('Seeding complete');
    })
    .catch((e) => {
        console.error('Seeding failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });

seed().then(()=>{
    console.log("ALL SEEDING DONE")
})