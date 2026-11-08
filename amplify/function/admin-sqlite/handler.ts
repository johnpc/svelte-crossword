import type { Handler } from 'aws-lambda';
import { createDatabaseProvider } from '../db/open-database';
import { executeAdminSql, type AdminSqlEvent } from './execute-admin-sql';

// SQLite twin of admin-sql: runs arbitrary parameterized SQL against the EFS
// database for laptop admin scripts (scripts/admin-sql-client.ts). Same
// { sql, params } -> { rows } contract. Invocable ONLY with admin IAM
// credentials — never granted to the app's authenticated/guest roles.
const getDb = createDatabaseProvider(process.env.DB_PATH ?? '/mnt/db/crossword.sqlite');

export const handler: Handler<AdminSqlEvent> = async (event) => executeAdminSql(getDb(), event);
