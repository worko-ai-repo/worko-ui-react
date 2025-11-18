/**
 * UserRole
 *
 * @description   This enum defines the different user roles in the application.
 */
export enum UserRole {
  GENERAL_USER = "general-user",
  CORPORATE = "corporate",
  CORPORATE_ADMIN = "corporate-admin",
  CORPORATE_RECRUITER = "corporate-recruiter",
  ADMIN = "admin",
  LINKEDIN = "linkedin",
  EVALUATOR = "evaluator",
  AGENCY = "agency",
}

/**
 * UserRolesActions
 *
 * @description   This type refer to user roles to their respective actions in the application.
 */
export type UserRolesActions = "view_jobs" | "apply_jobs" | "create_jobs" | "delete_jobs" | "manage_users" | "evaluate_candidates";

/**
 * RolePermissions
 *
 * @enum {UserRole} - UserRole
 * @type {string} - actions that each role can perform
 * @description   This object defines the permissions associated with each user role in the application.
 */
export const RolePermissions: Record<UserRole, UserRolesActions[]> = {
  [UserRole.ADMIN]: ["view_jobs", "create_jobs", "delete_jobs", "manage_users","apply_jobs"],
  [UserRole.CORPORATE]: ["view_jobs", "create_jobs", "delete_jobs", "manage_users"],
  [UserRole.CORPORATE_ADMIN]: ["view_jobs", "create_jobs", "delete_jobs", "manage_users"],
  [UserRole.EVALUATOR]: ["view_jobs", "evaluate_candidates"],
  [UserRole.CORPORATE_RECRUITER]: ["view_jobs", "create_jobs"],
  [UserRole.LINKEDIN]: ["view_jobs", "apply_jobs"],
  [UserRole.GENERAL_USER]: ["view_jobs", "apply_jobs"],
  [UserRole.AGENCY]: ["view_jobs", "apply_jobs"],
};
