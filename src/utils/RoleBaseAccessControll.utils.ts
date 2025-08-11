// utils/rbac.ts
import React from "react";
import secureStorage from "./SecureStorage.utils";
import { SecureStorageKeyEnum } from "@Enums/SecureStorage.enum";
import { RolePermissions, UserRole, UserRolesActions } from "@Interfaces/RoleBasedAccessControl";

export class RBAC {
  // Private static role initialized from localStorage
  private static _role: UserRole[] = RBAC.getStoredRole();

  private static getStoredRole(): UserRole[] {
   const userType =  secureStorage.getItem<UserRole[]>(SecureStorageKeyEnum.USERTYPE);
   if(userType){
    return userType;
   }else{
    return [UserRole.GENERAL_USER];
   }
  }

  public static get role(): UserRole[] {
    return this._role;
  }

  public static set role(newRole: UserRole[]) {
    this._role = newRole;
    localStorage.setItem("user_role", JSON.stringify(newRole)); // optional: sync storage
  }

  // Check if a role has a permission
  static can(action: UserRolesActions): boolean {
    const allowed = this._role.flatMap(role => RolePermissions[role] || []);
    return allowed.includes(action);
  }

  // Check if role has any of the given actions
  static canAny(actions: UserRolesActions[]): boolean {
    const allowed = this._role.flatMap(role => RolePermissions[role] || []);
    return actions.some(action => allowed.includes(action));
  }

  // Check if role has all of the given actions
  static canAll(actions: UserRolesActions[]): boolean {
    const allowed = this._role.flatMap(role => RolePermissions[role] || []);
    return actions.every(action => allowed.includes(action));
  }

  // HOC to wrap component with permission check
  static withPermission(action: UserRolesActions) {
    return function <P extends object>(
      WrappedComponent: React.ComponentType<P>
    ): React.FC<P> {
      return function RBACWrappedComponent(props: P) {
        if (!RBAC.can(action)) return null;
        return React.createElement(WrappedComponent, { ...props });
      };
    };
  }
}
