export class UnauthorizedAccessError extends Error {
	public Navto?: string;

	constructor(message : 'default' | 'Corporate' | 'Admin' | 'General') {
		super(message);
		this.name = 'UnauthorizedAccessError';
	}
}
