
import { getUserRoleById, getAllUserRoles, checkUserHasRoleOrHigher, getSuperAdmins } from "./queries";
import { updateUserRole, createUserRole, toggleUserStatus } from "./mutations";

export const userRoleApi = {
  getByUserId: getUserRoleById,
  updateRole: updateUserRole,
  createRole: createUserRole,
  getAllRoles: getAllUserRoles,
  hasRoleOrHigher: checkUserHasRoleOrHigher,
  toggleStatus: toggleUserStatus,
  getSuperAdmins: getSuperAdmins,
};

export * from "./types";
