import { defineConfig } from 'drizzle-kit';
import 'dotenv/config';

import type { Config } from 'drizzle-kit';
import * as dotenv from 'dotenv';
dotenv.config();

export default {
  schema: './src/database/schema/*',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    host: 'ep-steep-tree-adqzohdy-pooler.c-2.us-east-1.aws.neon.tech',
    user: 'neondb_owner',
    password: 'npg_Iz1nAGaw2fZh',
    database: 'neondb',
    ssl: true
  }
} satisfies Config;
