import type { StreakInfo } from '../../helpers/sql/getStreakInfo';
import type { UserHistoryEntry } from '../../helpers/sql/getUserHistory';

export type HistoryData = {
	completedPuzzles: UserHistoryEntry[];
	streakInfo: StreakInfo;
};

export interface HistoryDataDeps {
	getCurrentUser: () => Promise<unknown>;
	getOrCreateProfile: () => Promise<{ id: string }>;
	getUserHistory: (profileId: string) => Promise<UserHistoryEntry[]>;
	getStreakInfo: (profileId: string) => Promise<StreakInfo>;
	onUnauthenticated: () => void;
}

/**
 * Loads the signed-in user's completed-puzzle history and streak info. If the
 * user is not authenticated, invokes onUnauthenticated and returns null.
 */
export const loadHistoryData = async (deps: HistoryDataDeps): Promise<HistoryData | null> => {
	try {
		await deps.getCurrentUser();
	} catch {
		deps.onUnauthenticated();
		return null;
	}
	const profile = await deps.getOrCreateProfile();
	const completedPuzzles = await deps.getUserHistory(profile.id);
	const streakInfo = await deps.getStreakInfo(profile.id);
	return { completedPuzzles, streakInfo };
};

export interface DeleteAccountDeps {
	confirm: (message: string) => boolean;
	resetPuzzleStoreDefaults: () => void;
	deleteUser: () => Promise<unknown>;
	signOut: () => Promise<unknown>;
	onComplete: () => void;
}

/**
 * Confirms with the user, then permanently deletes their account and signs out.
 * Returns true if the deletion ran, false if the user cancelled.
 */
export const deleteAllUserData = async (deps: DeleteAccountDeps): Promise<boolean> => {
	const confirmed = deps.confirm(
		'Are you sure? This will destroy your account and log you out immediately. It cannot be undone.'
	);
	if (!confirmed) return false;
	deps.resetPuzzleStoreDefaults();
	await deps.deleteUser();
	await deps.signOut();
	deps.onComplete();
	return true;
};
