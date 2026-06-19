// The @event-calendar package ships no type declarations. It's only used in the
// history page to render a read-only activity calendar, so a minimal module
// shim is sufficient to keep the type-checker honest without pulling in `any`.
declare module '@event-calendar/core' {
	import type { Component } from 'svelte';
	export const Calendar: Component<Record<string, unknown>>;
	export const DayGrid: unknown;
}

declare module '@event-calendar/core/index.css';
