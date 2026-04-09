type EmploymentLike = any;

const OWNER_ROLE_NAME = "Owner";

export const getEmploymentBusinessId = (employment: EmploymentLike): string => {
  return employment?.businessId || employment?.business?.id || "";
};

export const isActiveEmployment = (employment: EmploymentLike): boolean => {
  const status = String(employment?.status || "").toLowerCase();
  return status ? status === "active" : true;
};

export const findEmploymentByBusinessId = (
  employments: EmploymentLike[],
  businessId: string
): EmploymentLike | null => {
  if (!businessId) return null;
  const list = Array.isArray(employments) ? employments : [];
  return (
    list.find((employment) => {
      if (!isActiveEmployment(employment)) return false;
      return getEmploymentBusinessId(employment) === businessId;
    }) || null
  );
};

export const getPermissionLevel = (
  employment: EmploymentLike,
  permissionKey: string
): number => {
  if (!employment?.role) return 0;

  const rawValue = employment?.role?.permissions?.[permissionKey];
  if (typeof rawValue === "number") return rawValue;

  const roleName = employment?.role?.role?.name || employment?.role?.name || "";
  if (roleName === OWNER_ROLE_NAME) return 3;

  return 0;
};

export const canReadPermission = (
  employment: EmploymentLike,
  permissionKey: string
): boolean => getPermissionLevel(employment, permissionKey) >= 1;

export const canEditPermission = (
  employment: EmploymentLike,
  permissionKey: string
): boolean => getPermissionLevel(employment, permissionKey) >= 2;

export const canDeletePermission = (
  employment: EmploymentLike,
  permissionKey: string
): boolean => getPermissionLevel(employment, permissionKey) >= 3;
