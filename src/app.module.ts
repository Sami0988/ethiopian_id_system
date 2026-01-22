import { Module } from "@nestjs/common";
import { FastifyAdapter } from "@nestjs/platform-fastify";
import { DatabaseModule } from "./database/database.module";
import { ConfigModule } from "./config/config.module";

@Module({
  imports: [ConfigModule, DatabaseModule],
})
export class AppModule {}
