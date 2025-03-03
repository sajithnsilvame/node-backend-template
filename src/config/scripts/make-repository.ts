import fs from 'fs';
import path from 'path';

const generateRepositoryFile = (RepositoryName: string) => {
    const repositoryContent = `
import ${RepositoryName} from "../models/${RepositoryName.toLowerCase()}.model";
import { I${RepositoryName}Repository } from "../types/repo/I${RepositoryName}Repository";
    
export class ${RepositoryName}Repository implements I${RepositoryName}Repository {
    
    async create${RepositoryName}(${RepositoryName.toLowerCase()}Data: Partial<${RepositoryName}>): Promise<${RepositoryName}> {
        return await ${RepositoryName}.create(${RepositoryName.toLowerCase()}Data);
    }

    async getAll${RepositoryName}s(): Promise<${RepositoryName}[]> {
        return await ${RepositoryName}.findAll();
    }

    async find${RepositoryName}ById(${RepositoryName.toLowerCase()}Id: number): Promise<${RepositoryName} | null> {
        return await ${RepositoryName}.findByPk(${RepositoryName.toLowerCase()}Id);
    }

    async update${RepositoryName}(${RepositoryName.toLowerCase()}Id: number, updateData: Partial<${RepositoryName}>): Promise<${RepositoryName} | null> {
        const ${RepositoryName.toLowerCase()} = await this.find${RepositoryName}ById(${RepositoryName.toLowerCase()}Id);
        if (!${RepositoryName.toLowerCase()}) return null;
        return await ${RepositoryName.toLowerCase()}.update(updateData);
            
    }   

    async delete${RepositoryName}(${RepositoryName.toLowerCase()}Id: number): Promise<boolean> {
        const ${RepositoryName.toLowerCase()} = await this.find${RepositoryName}ById(${RepositoryName.toLowerCase()}Id);
        if (!${RepositoryName.toLowerCase()}) return false;
        await ${RepositoryName.toLowerCase()}.destroy();
        return true;
    }
}`;

// Define the file path
  const filePath = path.join(__dirname, `../../repositories/${RepositoryName.toLowerCase()}.repository.ts`);

  // Write the file
  fs.writeFileSync(filePath, repositoryContent.trim());

  console.log(`✅ ${RepositoryName} repository generated successfully at: ${filePath}`);
}

const generateRepositoryInterfaceFile = (RepositoryName: string) => {
    const repositoryInterfaceContent = `
import ${RepositoryName} from "../../models/${RepositoryName.toLowerCase()}.model";
        
export interface I${RepositoryName}Repository {
    create${RepositoryName}(${RepositoryName.toLowerCase()}: Partial<${RepositoryName}>): Promise<${RepositoryName}>;
    getAll${RepositoryName}s(): Promise<${RepositoryName}[]>;
    find${RepositoryName}ById(${RepositoryName.toLowerCase()}Id: number): Promise<${RepositoryName} | null>;
    update${RepositoryName}(${RepositoryName.toLowerCase()}Id: number, updateData: Partial<${RepositoryName}>): Promise<${RepositoryName} | null>;
    delete${RepositoryName}(${RepositoryName.toLowerCase()}Id: number): Promise<boolean>;
}`;

// Define the file path
  const filePath = path.join(__dirname, `../../types/repo/I${RepositoryName}Repository.ts`);

  // Write the file
  fs.writeFileSync(filePath, repositoryInterfaceContent.trim());

  console.log(`✅ ${RepositoryName} repository Interface generated successfully at: ${filePath}`);
}


const repositoryName = process.argv[2];
if (!repositoryName) {
  console.error("⚠️ Please provide a repository name. Usage: npm run make:repo <RepositoryName>");
  process.exit(1);
}

// Generate the repository file
generateRepositoryFile(repositoryName);
generateRepositoryInterfaceFile(repositoryName);

// =======================developed by Sajith==========================================//