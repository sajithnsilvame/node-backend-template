import { Router } from "express";
import { container } from "tsyringe";
import { UserRoleController } from "../controllers/userRole.controller";
import { Authenticated } from '../middlewares/auth.middleware';
import { canAccess } from "../middlewares/checkRole.middleware";

const router = Router();
const userRoleController = container.resolve(UserRoleController);

/**
 * @swagger
 * /user-role/create:
 *   post:
 *     tags: [User Role]
 *     summary: User role create
 *     description: Create a user role
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_name:
 *                 type: string
 *                 example: "manager"
 *               description:
 *                 type: string
 *                 example: "this user has limited access"
 *     responses:
 *       200:
 *         description: User role created successfully
 */
router.post("/create", Authenticated, canAccess(['superadmin']), userRoleController.createUserRole.bind(userRoleController));

/**
 * @swagger
 * /user-role/get-all:
 *   get:
 *     tags: [User Role]
 *     summary: Get all user roles
 *     description: Get all user roles
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Get all user roles
 */
router.get('/get-all', Authenticated, canAccess(['superadmin']), userRoleController.getAllUserRoles.bind(userRoleController));

/**
 * @swagger
 * /user-role/get/{id}:
 *   get:
 *     tags: [User Role]
 *     summary: Get a specific user role by ID
 *     description: Retrieves a specific user role item by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user role
 *     responses:
 *       200:
 *         description: A single user role
 *       404:
 *         description: User role not found
 */
router.get('/get/:id', Authenticated, canAccess(['superadmin']), userRoleController.getUserRoleById.bind(userRoleController));

/**
 * @swagger
 * /user-role/update/{id}:
 *   put:
 *     tags: [User Role]
 *     summary: Update a user role
 *     description: Update a user role by ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               role_name:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: User role updated successfully
 *       404:
 *         description: User role not found
 */
router.put('/update/:id', Authenticated, canAccess(['superadmin']), userRoleController.updateUserRole.bind(userRoleController));

/**
 * @swagger
 * /user-role/delete/{id}:
 *   delete:
 *     tags: [User Role]
 *     summary: Delete a user role
 *     description: Deletes a user role item by its ID
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: The ID of the user role to delete
 *     responses:
 *       200:
 *         description: Todo deleted successfully
 *       404:
 *         description: Todo not found
 */
router.delete('/delete/:id', Authenticated, canAccess(['superadmin']), userRoleController.deleteUserRole.bind(userRoleController));

export default router;