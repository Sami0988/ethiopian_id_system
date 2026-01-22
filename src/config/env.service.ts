import { Injectable } from "@nestjs/common";
import { HttpAdapterHost } from "@nestjs/core";
import { FastifyInstance } from "fastify";
import { EnvConfig } from "./fastify-env.schema";

// Type extension for FastifyInstance with @fastify/env plugin
declare module "fastify" {
  interface FastifyInstance {
    env: EnvConfig;
  }
}

@Injectable()
export class EnvService {
  private readonly fastify: FastifyInstance;

  constructor(private readonly adapterHost: HttpAdapterHost) {
    this.fastify = this.adapterHost.httpAdapter.getInstance<FastifyInstance>();
  }

  get env(): EnvConfig {
    return this.fastify.env;
  }

  // Convenience getters for commonly used values
  get isDevelopment(): boolean {
    return this.env.NODE_ENV === "development";
  }

  get isProduction(): boolean {
    return this.env.NODE_ENV === "production";
  }

  get isTest(): boolean {
    return this.env.NODE_ENV === "test";
  }

  get dbConfig() {
    return {
      host: this.env.DB_HOST,
      port: this.env.DB_PORT,
      username: this.env.DB_USERNAME,
      password: this.env.DB_PASSWORD,
      database: this.env.DB_DATABASE,
      ssl: this.env.DB_SSL,
    };
  }

  get redisConfig() {
    return {
      url: this.env.REDIS_URL,
      host: this.env.REDIS_HOST,
      port: this.env.REDIS_PORT,
      password: this.env.REDIS_PASSWORD,
      db: this.env.REDIS_DB,
      maxConnections: this.env.REDIS_MAX_CONNECTIONS,
      tlsEnabled: this.env.REDIS_TLS_ENABLED,
    };
  }

  get jwtConfig() {
    return {
      accessSecret: this.env.JWT_ACCESS_SECRET, // updated
      accessExpiresIn: this.env.JWT_ACCESS_EXPIRY, // updated
      refreshSecret: this.env.JWT_REFRESH_SECRET, // updated
      refreshExpiresIn: this.env.JWT_REFRESH_EXPIRY, // updated
    };
  }

  get emailConfig() {
    return {
      host: this.env.SMTP_HOST,
      port: this.env.SMTP_PORT,
      user: this.env.SMTP_USER,
      pass: this.env.SMTP_PASS,
      secure: this.env.SMTP_SECURE,
      fromName: this.env.EMAIL_FROM_NAME,
      fromAddress: this.env.EMAIL_FROM_ADDRESS,
      allowSend: this.env.EMAIL_ALLOW_SEND,
    };
  }
}
