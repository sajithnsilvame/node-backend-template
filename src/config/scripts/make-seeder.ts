import * as fs from "fs/promises";
import * as path from "path";

// Get command-line arguments
const args = process.argv.slice(2);
const seederName = args[0];

if (!seederName) {
  console.error("⚠️ Please provide a seeder name. Example: npm run make:seeder SeederName");
  process.exit(1);
}

console.log(`🌱 Seeder Name: ${seederName}`);

// Paths
const seedersDir = path.join(process.cwd(), "src", "seeders");
const timestamp = new Date().toISOString().replace(/[-T:\.Z]/g, "").slice(0, 14);
const seederFileName = `${seederName.toLowerCase()}.ts`;
const seederFilePath = path.join(seedersDir, seederFileName);

// Seeder template
const seederTemplate = `
import { QueryInterface } from 'sequelize';

const demo${seederName}s = [
    {
        // Define your fields here
        title: 'Sample ${seederName} 1',
        completed: false,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
    {
        title: 'Sample ${seederName} 2',
        completed: true,
        createdAt: new Date(),
        updatedAt: new Date(),
    },
];

export const up = async (queryInterface: QueryInterface) => {
    await queryInterface.bulkInsert('${seederName.toLowerCase()}s', demo${seederName}s, {});
};

export const down = async (queryInterface: QueryInterface) => {
    await queryInterface.bulkDelete('${seederName.toLowerCase()}s', {
        title: demo${seederName}s.map(item => item.title),
    }, {});
};
`;

// Create the seeder file
(async () => {
  try {
    // Ensure the seeders directory exists
    await fs.mkdir(seedersDir, { recursive: true });

    // Write the seeder file
    await fs.writeFile(seederFilePath, seederTemplate, "utf8");
    console.log(`✅ Seeder file  created successfully: ${seederFilePath} `);
  } catch (err) {
    console.error("❌ Error creating seeder file:", err);
  }
})();

// =======================developed by Sajith==========================================//
