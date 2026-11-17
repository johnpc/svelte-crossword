import { vibrate } from '../helpers/haptics';
import { createPuzzleSession } from '../helpers/session/puzzleSessionStore';
import type { CrosswordClues } from '../helpers/types/types';
import { previewClues } from './previewClues';

export const PREVIEW_PUZZLE: CrosswordClues = { id: 'preview', clues: previewClues };

/**
 * @state-machine preview-session — one module-level sitting for the signed-out
 * preview, so a finished preview stays finished while the visitor browses the
 * site (the former `completedPreview` flag). Only the solved phase survives a
 * revisit; PuzzlePreview resets anything else on mount.
 */
export const previewSession = createPuzzleSession(() => void vibrate());

export const resetPreviewSession = (): void => void previewSession.send({ type: 'reset' });
