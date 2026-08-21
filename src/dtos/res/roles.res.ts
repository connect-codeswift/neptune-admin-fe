/** GET /SuperAdminRoles list item */
export type RoleResponse = {
  id: number;
  roleName: string;
  description?: string | null;
  permissionCount?: number;
  isSystem: boolean;
  usersAssigned: number;
};

/** GET /v1/super-admin/roles/permissions item */
export type PermissionResponse = {
  id: number;
  /** The claim string and the gate name: `Incident.Create`. */
  displayName: string;
  /** Owning module. */
  moduleId: number;
  moduleCode: string;
  moduleName: string;
  /**
   * `View` / `Create` / `Update` / `Delete` become the grid's columns; anything
   * else is a named extra behind the module row's expander.
   */
  action: string;
  /** True when `action` is one of the four CRUD verbs. Computed server-side so
   * the two frontends cannot disagree about where a row belongs. */
  isCrud: boolean;
  /** Legacy aliases the API still emits for older clients. */
  categoryId?: number;
  categoryName?: string;
};

/** How a module is licensed. Only `Ehs` can be switched off per company. */
export type ModuleKind = "Ehs" | "Platform" | "AdminPortal";

/** One module and every action a role can be granted inside it. */
export type ModuleResponse = {
  id: number;
  code: string;
  name: string;
  kind: ModuleKind;
  sortOrder: number;
  /** False for Platform and AdminPortal, which every company has. */
  isLicensable: boolean;
  /**
   * Whether the selected company holds a licence. Always true when not
   * licensable. An unlicensed module renders greyed with its ticks preserved
   * but disabled: the grants survive, they just stop being minted into tokens.
   */
  isLicensed: boolean;
  crudPermissions: PermissionResponse[];
  extraPermissions: PermissionResponse[];
};

/** GET /v1/super-admin/roles/catalog */
export type PermissionCatalogResponse = {
  /** Licensable EHS modules, in sidebar order. */
  modules: ModuleResponse[];
  /** Shared resources every company has: Locations, Departments, Files, ... */
  platform: ModuleResponse[];
  /** The admin portal's own rights. */
  adminPortal: ModuleResponse[];
};

/** GET /SuperAdminRoles/with-permissions item */
export type RoleWithPermissionsResponse = RoleResponse & {
  permissions?: PermissionResponse[] | null;
  permissionIds?: number[] | null;
};

export type RolesPageResponse = {
  data?: RoleResponse[];
  totalRecords?: number;
  pageNumber?: number;
  pageSize?: number;
};

/** POST /SuperAdminRoles response */
export type CreateRoleResponse = RoleResponse | number;
