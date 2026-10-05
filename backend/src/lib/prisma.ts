import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

// Load environment variables before creating the Prisma client
dotenv.config();

const prisma = new PrismaClient();

export default prisma;
