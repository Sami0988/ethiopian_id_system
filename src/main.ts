import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import { registerPlugins } from "./bootstrap/register-plugins";
import { fastifyEnvSchema } from "./config";
import fastifyEnv from "@fastify/env";
import { pinoOptions } from "./common/logging";
import { registerRequestContext } from "./bootstrap/register-request-context";
import { registerRequestLogging } from "./bootstrap/register-request-logging";
import { registerGlobals } from "./bootstrap/register-globals";
import { registerErrorHandler } from "./bootstrap/register-error-handler";
import { DocumentBuilder, SwaggerModule } from "@nestjs/swagger";

async function bootstrap() {
  // ✅ Enable Fastify logger with Pino (structured JSON logs)
  const adapter = new FastifyAdapter({ logger: pinoOptions });
  const fastifyInstance = adapter.getInstance();

  // ✅ Register @fastify/env (Ajv-based, very fast)
  await fastifyInstance.register(fastifyEnv, {
    confKey: "env",
    schema: fastifyEnvSchema,
    dotenv: true,
  });

  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    adapter,
  );

  // Access validated env
  const env = fastifyInstance.env;

  // Register AsyncLocalStorage request context (requestId, tenantId, userId)
  registerRequestContext(app);

  // ---- Register request logging (method, path, status, duration, requestId)
  registerRequestLogging(app);

  // Register Fastify plugins
  await registerPlugins(app);

  // Register global pipes, filters, interceptors
  registerGlobals(app);

  // Register error handler
  registerErrorHandler(app);

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle("NexusQR API")
    .setDescription("Multi-tenant QR Code & Digital Profile Management API")
    .setVersion("1.0.0")
    .addBearerAuth(
      {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        name: "JWT",
        description: "Enter Access Token",
        in: "header",
      },
      "access-token",
    )
    .addServer(env.APP_URL || "http://localhost:3000")
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    deepScanRoutes: true,
  });

  // Set global prefix from validated env
  app.setGlobalPrefix(env.API_PREFIX);

  // Setup Swagger at /api-docs to avoid path conflicts
  SwaggerModule.setup("api-docs", app, document, {
    explorer: true,
    swaggerOptions: {
      persistAuthorization: true,
      withCredentials: true,
      docExpansion: "list",
      filter: true,
      showRequestDuration: true,
    },
  });

  await app.listen(env.APP_PORT, env.APP_HOST);

  console.log(
    `🚀 NexusQR Core API running on: http://${env.APP_HOST}:${env.APP_PORT}${env.API_PREFIX}`,
  );
}
bootstrap();
