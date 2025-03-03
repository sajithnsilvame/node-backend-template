import { exec } from 'child_process';

const seederName = process.argv[2];

if (!seederName) {
    console.error('⚠️ Please provide a seeder name');
    process.exit(1);
}

const command = `node -r ts-node/register ./node_modules/sequelize-cli/lib/sequelize db:seed:undo --seed ${seederName}`;

exec(command, (error, stdout, stderr) => {
    if (error) {
        console.error(`Error: ${error}`);
        return;
    }
    console.log(stdout);
});


// =======================developed by Sajith==========================================//