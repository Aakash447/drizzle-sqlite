import 'dotenv/config';
import { drizzle } from 'drizzle-orm/libsql';

const dbUrl = process.env.DB_FILE_NAME || 'file:local.db';
console.log('drizzle config dbUrl:',dbUrl)

const db = drizzle(dbUrl!);
export { db };

