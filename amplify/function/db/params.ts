import type { SQLInputValue } from 'node:sqlite';

const NATIVE_TYPES = new Set(['number', 'bigint', 'string']);

const isNative = (value: unknown): value is SQLInputValue =>
	value === null || NATIVE_TYPES.has(typeof value) || value instanceof Uint8Array;

/**
 * node:sqlite only binds null | number | bigint | string | Uint8Array and
 * throws on anything else (booleans and undefined included). Callers used to
 * mysql2's looser binding pass booleans, undefined and Dates, so coerce them
 * to the closest SQLite value. Remaining objects are stored as JSON text.
 */
export function toSqlValue(value: unknown): SQLInputValue {
	if (value === undefined) return null;
	if (isNative(value)) return value;
	if (typeof value === 'boolean') return Number(value);
	if (value instanceof Date) return value.toISOString();
	return JSON.stringify(value);
}

export function toSqlParams(params: readonly unknown[] = []): SQLInputValue[] {
	return params.map(toSqlValue);
}
