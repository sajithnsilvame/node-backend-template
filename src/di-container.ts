import "reflect-metadata";
import { container } from "tsyringe";
import { AuthService } from "./services/auth.service";
import AuthController from "./controllers/auth.controller";

// Register classes with the container
container.registerSingleton<AuthService>(AuthService);
container.registerSingleton(AuthController, AuthController);




// container.registerTransient<TodoService>(TodoService);
// container.registerInstance<TodoService>(mockTodoService);



export { container };
