import "reflect-metadata";
import { container } from "tsyringe";
import { AuthService } from "./services/auth.service";
import AuthController from "./controllers/auth.controller";
import { UserRoleService } from "./services/userRole.service";
import { UserRoleController } from "./controllers/userRole.controller";

// Register classes with the container
container.registerSingleton<AuthService>(AuthService);
container.registerSingleton(AuthController, AuthController);

container.registerSingleton<UserRoleService>(UserRoleService);
container.registerSingleton(UserRoleController, UserRoleController);


// container.registerTransient<TodoService>(TodoService);
// container.registerInstance<TodoService>(mockTodoService);



export { container };
