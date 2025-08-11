import { UserRole } from "@Interfaces/RoleBasedAccessControl";

export class UnauthorizedAccessError extends Error {
	public Navto?: string;
	public userRoles?: UserRole[];

	constructor(message: UserRole | UserRole[]) {
		// Convert to string for the error message
		const messageStr = Array.isArray(message) ? message.join(', ') : message;
		super(messageStr);
		this.name = 'UnauthorizedAccessError';
		// Store the original roles for better handling
		this.userRoles = Array.isArray(message) ? message : [message];
	}
}