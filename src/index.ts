import { swagger } from '@elysiajs/swagger'
import { app } from "./route/app";
app.use(swagger()).listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`
);
