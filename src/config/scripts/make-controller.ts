import fs from 'fs';
import path from 'path';

const generateControllerFile = (controllerName: string) => {
    const controllerContent = `
import { inject, injectable } from "tsyringe";
import { Request, Response, NextFunction } from "express";
import { ${controllerName}Service } from "../services/${controllerName.toLowerCase()}.service";
import { APIResponse } from "../types";
import { AppError } from "../utils/AppError";


@injectable()
export class ${controllerName}Controller  {
    constructor(@inject(${controllerName}Service) private ${controllerName.toLowerCase()}Service: ${controllerName}Service) {}

    async create${controllerName}(req: Request, res: Response): Promise<void> {
        try {
            const new${controllerName} = await this.${controllerName.toLowerCase()}Service.create${controllerName}(req.body);
            const response : APIResponse<typeof new${controllerName}> = {status: true, message: "${controllerName} created successfully"};
            res.status(201).json(response);
        } catch (error: any) {
            const response: APIResponse<null> = { status: false, error: error.message };
            res.status(500).json(response); 
        }
    }

    async getAll${controllerName}s(req: Request, res: Response): Promise<void> {
        try {
            const ${controllerName.toLowerCase()} = await this.${controllerName.toLowerCase()}Service.getAll${controllerName}s();
            const response: APIResponse<typeof ${controllerName.toLowerCase()}> = { status: true, data: ${controllerName.toLowerCase()} };
            res.status(200).json(response);
        } catch (error: any) {
            const response: APIResponse<null> = { status: false, error: error.message };
            res.status(500).json(response);
        }
    }

    async get${controllerName}ById(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;
            console.log(id);
            // Validate the ID
            if (isNaN(Number(id))) {
                return next(new AppError(400, 'Invalid ID format'));
            }

            const ${controllerName.toLowerCase()} = await this.${controllerName.toLowerCase()}Service.find${controllerName}ById(Number(id));
            if (!${controllerName.toLowerCase()}) {
                return next(new AppError(404, '${controllerName} not found'));
            }

            const response: APIResponse<typeof ${controllerName.toLowerCase()}> = { status: true, data: ${controllerName.toLowerCase()} };
            res.status(200).json(response);
        } catch (error: any) {
            const response: APIResponse<null> = { status: false, error: error.message };
            res.status(500).json(response);
        }
    }

    async update${controllerName}(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // Validate the ID
            if (isNaN(Number(id))) {
                return next(new AppError(400, 'Invalid ID format'));
            }

            const ${controllerName.toLowerCase()} = await this.${controllerName.toLowerCase()}Service.update${controllerName}(Number(id), req.body);
            if (!${controllerName.toLowerCase()}) {
                return next(new AppError(404, '${controllerName} not found'));
            }

            const response: APIResponse<typeof ${controllerName.toLowerCase()}> = { status: true, data: ${controllerName.toLowerCase()} };
            res.status(200).json(response);
        } catch (error: any) {
            const response: APIResponse<null> = { status: false, error: error.message };
            res.status(500).json(response);
        }
    }

    async delete${controllerName}(req: Request, res: Response, next: NextFunction): Promise<void> {
        try {
            const { id } = req.params;

            // Validate the ID
            if (isNaN(Number(id))) {
                return next(new AppError(400, 'Invalid ID format'));
            }

            const isDeleted = await this.${controllerName.toLowerCase()}Service.delete${controllerName}(Number(id));
            if (!isDeleted) {
                return next(new AppError(404, '${controllerName} not found'));
            }

            const response: APIResponse<null> = { status: true, message: '${controllerName} deleted successfully' };
            res.status(200).json(response);
        } catch (error: any) {
            const response: APIResponse<null> = { status: false, error: error.message };
            res.status(500).json(response);
        }
    }
}`;

// Define the file path
  const filePath = path.join(__dirname, `../../controllers/${controllerName.toLowerCase()}.controller.ts`);

  // Write the file
  fs.writeFileSync(filePath, controllerContent.trim());

  console.log(`✅ ${controllerName} controller generated successfully at: ${filePath}`);
}

// Get the controller name from the command line
const controllerName = process.argv[2];
if (!controllerName) {
  console.error("⚠️ Please provide a controller name. Usage: npm run make:controller <ControllerName>");
  process.exit(1);
}

// Generate the controller file
generateControllerFile(controllerName);

// =======================developed by Sajith==========================================//