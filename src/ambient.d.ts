// The @event-calendar packages ship no type declarations. They're only used in
// the history page to render a read-only activity calendar, so a minimal module
// shim is sufficient to keep the type-checker honest without pulling in `any`.
declare module '@event-calendar/core' {
	import type { SvelteComponent } from 'svelte';
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const Calendar: typeof SvelteComponent<any>;
	export default Calendar;
}

declare module '@event-calendar/day-grid' {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const DayGrid: any;
	export default DayGrid;
}

declare module '@event-calendar/core/index.css';
