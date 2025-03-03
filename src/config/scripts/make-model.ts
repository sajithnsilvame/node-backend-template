import * as fs from "fs/promises";
import * as path from "path";

const args = process.argv.slice(2);
const capitalizeFirstLetter = (str: string) => str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
const modelName = capitalizeFirstLetter(args[0]);
const createMigration = args.includes("+m");

if (!modelName) {
  console.error("❌ Please provide a model name.");
  process.exit(1);
}

console.log(`Model Name: ${modelName}`);
console.log(`✅ Create Migration: ${createMigration}`);

// Directories
const modelsDir = path.join(process.cwd(), "src", "models");
const migrationsDir = path.join(process.cwd(), "src", "migrations");
const modelFilePath = path.join(modelsDir, `${modelName.toLowerCase()}.model.ts`);
const relativeModelFilePath = path.relative(process.cwd(), modelFilePath);

(async () => {
  try {
    // Check if the model file already exists
    const exists = await fs
      .access(modelFilePath)
      .then(() => true)
      .catch(() => false);

    if (exists) {
      console.log(`⚠️  Model "${modelName}" already exists.`);
      process.exit(0);
    }

    // Model template
    const modelTemplate = `
import { Model, DataTypes } from 'sequelize';
import sequelize from '../config/database';

export class ${modelName} extends Model {}

${modelName}.init({
    // Define your schema fields here
    // Example:
    // name: {
    //   type: DataTypes.STRING,
    //   allowNull: false,
    // },
}, {
    sequelize,
    tableName: '${modelName.toLowerCase()}s', // Adjust the table name if needed
    timestamps: true,
});

export default ${modelName};
`;

    // Ensure the models directory exists
    await fs.mkdir(modelsDir, { recursive: true });

    // Write model file
    await fs.writeFile(modelFilePath, modelTemplate);
    console.log(
      `✅ ${modelName} model created successfully. < ${relativeModelFilePath} >`
    );

    // Create a migration file if the '--m' or '-m' flag is present
    if (createMigration) {
      console.log("🔄 Creating migration file...");
      const now = new Date();
      const timestamp = `${now.getFullYear()}_${String(now.getMonth() + 1).padStart(2, "0")}_${String(now.getDate()).padStart(2, "0")}_${String(now.getHours()).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(now.getSeconds()).padStart(2, "0")}`;
      const migrationFileName = `${timestamp}_create_${modelName.toLowerCase()}_table.ts`;
      const migrationFilePath = path.join(migrationsDir, migrationFileName);

      const migrationTemplate = `
import { QueryInterface, DataTypes } from 'sequelize';

export default {
  up: async (queryInterface: QueryInterface) => {
    await queryInterface.createTable('${modelName.toLowerCase()}s', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      // Define other columns here
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
    }, 
    {
      charset: 'utf8mb4', 
      collate: 'utf8mb4_general_ci', 
    });
  },

  down: async (queryInterface: QueryInterface) => {
    await queryInterface.dropTable('${modelName.toLowerCase()}s');
  },
};
`;

      // Ensure the migrations directory exists
      await fs.mkdir(migrationsDir, { recursive: true });

      // Write migration file
      await fs.writeFile(migrationFilePath, migrationTemplate);
      console.log(
        `✅ Migration for "${modelName}" created successfully at < ${migrationFilePath} >.`
      );
    } else {
      console.log("⚠️ Migration flag not set, skipping migration creation.");
    }
  } catch (err) {
    console.error("❌ Error creating model or migration:", err);
  }
})();


// =======================developed by Sajith==========================================//
