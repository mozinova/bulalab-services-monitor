//Prisma singleton
import { PrismaClient } from "../generated/prisma/client";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";


const poll = new pg.Pool({
    connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(poll as any);

const globalForPrisma = global as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
    adapter,
});

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;