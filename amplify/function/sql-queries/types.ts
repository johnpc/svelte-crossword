/** Invoke payload accepted by the sql-queries Lambda (unchanged across the MySQL -> SQLite move). */
export interface UserPuzzleInput {
	id: string;
	profile_id: string;
	puzzle_id: string;
	used_check: number | boolean;
	used_clear: number | boolean;
	used_reveal: number | boolean;
	time_in_seconds: number;
}

export interface PuzzleInput {
	id: string;
	puz_json: string;
	puz_key: string | null;
	title: string | null;
	author: string | null;
}

export interface SqlQueryEvent {
	query?: string;
	profileId?: string;
	userId?: string;
	email?: string;
	name?: string;
	userPuzzleId?: string;
	puzzleId?: string;
	userPuzzle?: UserPuzzleInput;
	puzzle?: PuzzleInput;
}

export interface QueryResponse {
	statusCode: number;
	body: string;
}
