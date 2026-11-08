import type { Handler } from 'aws-lambda';
import { createDatabaseProvider } from '../db/open-database';
import { runQuery } from './run-query';
import type { QueryResponse, SqlQueryEvent } from './types';

// Serves the Svelte client and the iOS/Android builds. The invoke contract
// (payload shapes, field names, 0/1 booleans, ISO created_at strings) is the
// one the MySQL handler exposed; only the storage engine changed — SQLite on
// EFS at DB_PATH, one connection per container.
const getDb = createDatabaseProvider(process.env.DB_PATH ?? '/mnt/db/crossword.sqlite');

export const handler: Handler<SqlQueryEvent, QueryResponse> = async (event) =>
	runQuery(getDb(), event);
