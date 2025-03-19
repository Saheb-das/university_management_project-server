// internal import
import configRoles from "../config/roles.json";

// types import
import { TRole } from "../types/auth";

// permission model to check user role is permissable for this action or nots
export class Permissions {
  permissions: string[] | [];
  constructor() {
    this.permissions = [];
  }

  // Get permissions for a specific role
  getPermissionsByRoleName(roleName: TRole) {
    const role = configRoles.roles.find((role) => role.name === roleName);
    return role ? role.permissions : [];
  }
}
