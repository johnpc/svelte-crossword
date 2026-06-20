export class DeadlineError extends Error {
	constructor() {
		super('deadline');
		this.name = 'DeadlineError';
	}
}

export function checkDeadline(deadline: number): void {
	if (Date.now() >= deadline) throw new DeadlineError();
}
