import { Module } from "@nestjs/common";
import { ConfigModule } from "@/config/config.module";
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import { EnvService } from "@/config/env.service";
import * as schema from "./schema";

// Database connection provider
export const DATABASE_CONNECTION = "DATABASE_CONNECTION";
export { schema };

@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: DATABASE_CONNECTION,
      useFactory: async (envService: EnvService) => {
        const { dbConfig } = envService;

        // Create PostgreSQL client
        const client = postgres({
          host: dbConfig.host,
          port: dbConfig.port,
          user: dbConfig.username,
          password: dbConfig.password,
          database: dbConfig.database,
          ssl: dbConfig.ssl ? { rejectUnauthorized: false } : false,
          max: 10,
        });

        // Create Drizzle instance
        const db = drizzle(client, { schema });

        // Test connection
        try {
          await client`SELECT 1`;
          console.log("✅ Database connected successfully");
        } catch (error) {
          console.error("❌ Database connection failed:", error);
          throw error;
        }

        return db;
      },
      inject: [EnvService],
    },
  ],
  exports: [DATABASE_CONNECTION],
})
export class DatabaseModule {}
