import fs from 'fs';
import path from 'path';

// Function to generate the route file
const generateRouteFile = (routeName: string) => {
  const routeContent = `
import { Router } from "express";
import { container } from "tsyringe";
import { ${routeName}Controller } from "../controllers/${routeName.toLowerCase()}.controller";
import { Authenticated } from '../middlewares/auth.middleware';

const router = Router();
const ${routeName.toLowerCase()}Controller = container.resolve(${routeName}Controller);

/**
 * @swagger
 * /${routeName.toLowerCase()}/create:
 *   post:
 *     tags: [${routeName}]
 *     summary: Create a ${routeName}
 *     description: Create a new ${routeName}
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 example: "Example Name"
 *               description:
 *                 type: string
 *                 example: "Example Description"
 *     responses:
 *       200:
 *         description: ${routeName} created successfully
 */
router.post("/create", Authenticated, ${routeName.toLowerCase()}Controller.create${routeName}.bind(${routeName.toLowerCase()}Controller));

/**
 * @swagger
 * /${routeName.toLowerCase()}/get-all:
 *   get:
 *     tags: [${routeName}]
 *     summary: Get all ${routeName}s
 *     description: Retrieve all ${routeName}s
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of ${routeName}s
 */
router.get('/get-all', Authenticated, ${routeName.toLowerCase()}Controller.getAll${routeName}s.bind(${routeName.toLowerCase()}Controller));

/**
 * @swagger
 * /${routeName.toLowerCase()}/get/{id}:
 *   get:
 *     tags: [${routeName}]
 *     summary: Get a ${routeName} by ID
 *     description: Retrieve a specific ${routeName} by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the ${routeName}
 *     responses:
 *       200:
 *         description: A single ${routeName}
 *       404:
 *         description: ${routeName} not found
 */
router.get('/get/:id', Authenticated, ${routeName.toLowerCase()}Controller.get${routeName}ById.bind(${routeName.toLowerCase()}Controller));

/**
 * @swagger
 * /${routeName.toLowerCase()}/update/{id}:
 *   put:
 *     tags: [${routeName}]
 *     summary: Update a ${routeName}
 *     description: Update a ${routeName} by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the ${routeName}
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: ${routeName} updated successfully
 *       404:
 *         description: ${routeName} not found
 */
router.put('/update/:id', Authenticated, ${routeName.toLowerCase()}Controller.update${routeName}.bind(${routeName.toLowerCase()}Controller));

/**
 * @swagger
 * /${routeName.toLowerCase()}/delete/{id}:
 *   delete:
 *     tags: [${routeName}]
 *     summary: Delete a ${routeName}
 *     description: Delete a ${routeName} by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the ${routeName}
 *     responses:
 *       200:
 *         description: ${routeName} deleted successfully
 *       404:
 *         description: ${routeName} not found
 */
router.delete('/delete/:id', Authenticated, ${routeName.toLowerCase()}Controller.delete${routeName}.bind(${routeName.toLowerCase()}Controller));

export default router;
`;

  // Define the file path
  const filePath = path.join(__dirname, `../../routes/${routeName.toLowerCase()}.routes.ts`);

  // Write the file
  fs.writeFileSync(filePath, routeContent.trim());

  console.log(`✅ Route file generated successfully at: ${filePath}`);
};

// Get the route name from the command line
const routeName = process.argv[2];
if (!routeName) {
  console.error("⚠️ Please provide a route name. Usage: npm run make:route <RouteName>");
  process.exit(1);
}

// Generate the route file
generateRouteFile(routeName);

// =======================developed by Sajith==========================================//