import { useBusinessStore } from "@/stores/businessStore";
import {
  canDeletePermission,
  canEditPermission,
  canReadPermission,
  findEmploymentByBusinessId,
  getPermissionLevel,
} from "@/utils/businessPermissions";
import { useMemo } from "react";

type UseBusinessPermissionOptions = {
  businessId?: string;
  employments?: any[];
};

export const useBusinessPermission = (
  permissionKey: string,
  options?: UseBusinessPermissionOptions
) => {
  const selectedBusinesses = useBusinessStore((state) => state.selectedBusinesses);
  const myEmployments = useBusinessStore((state) => state.myEmployments);

  const targetBusinessId = options?.businessId || selectedBusinesses?.[0] || "";
  const employmentsSource =
    Array.isArray(options?.employments) && options.employments.length > 0
      ? options.employments
      : myEmployments;

  return useMemo(() => {
    const employment = findEmploymentByBusinessId(employmentsSource || [], targetBusinessId);
    const level = getPermissionLevel(employment, permissionKey);

    return {
      businessId: targetBusinessId,
      permissionKey,
      level,
      canRead: canReadPermission(employment, permissionKey),
      canEdit: canEditPermission(employment, permissionKey),
      canDelete: canDeletePermission(employment, permissionKey),
      employment,
    };
  }, [employmentsSource, permissionKey, targetBusinessId]);
};
