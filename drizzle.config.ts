import 'dotenv/config';
import { defineConfig } from 'drizzle-kit';
const dbUrl = process.env.DB_FILE_NAME
console.log('drizzle config dbUrl:',dbUrl)
export default defineConfig({
  out: './src/db/migrations',
  schema: './src/db/userSchema.ts',
  dialect: 'sqlite',
  dbCredentials: {
    url: dbUrl || 'file:local.db'
  },
});
