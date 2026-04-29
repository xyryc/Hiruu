import { useJobStore } from "@/stores/jobStore";
import { useCallback, useEffect, useState } from "react";

type UseUnreadApplicationsParams = {
    scope?: "user" | "business";
    businessId?: string;
    type?: "user_applied" | "business_invited";
    autoRefresh?: boolean;
    refreshInterval?: number;
};

export const useUnreadApplications = ({
    scope,
    businessId,
    type,
    autoRefresh = false,
    refreshInterval = 30000,
}: UseUnreadApplicationsParams = {}) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const getUnreadCount = useJobStore((s) => s.getUnreadCount);
    const markApplicationsAsRead = useJobStore((s) => s.markApplicationsAsRead);

    // Keep default scope stable as user unless explicitly set by caller.
    const effectiveScope = scope ?? "user";
    const effectiveBusinessId = businessId;

    // Only use type if explicitly provided - don't auto-detect
    const effectiveType = type;

    const fetchUnreadCount = useCallback(async () => {
        if (effectiveScope === "business" && !effectiveBusinessId) {
            setUnreadCount(0);
            return;
        }

        try {
            setIsLoading(true);
            setError(null);
            const queryParams: any = {
                scope: effectiveScope,
            };

            // Only add businessId if in business scope
            if (effectiveScope === "business" && effectiveBusinessId) {
                queryParams.businessId = effectiveBusinessId;
            }

            // Only add type if explicitly provided
            if (effectiveType) {
                queryParams.type = effectiveType;
            }

            const result = await getUnreadCount(queryParams);

            // Calculate total from the new response structure
            const userApplied = result.user_applied ?? 0;
            const businessInvited = result.business_invited ?? 0;
            const total = userApplied + businessInvited;

            setUnreadCount(total);
        } catch (err: any) {
            const message = err?.message || "Failed to fetch unread count";
            setError(message);
            console.error("Failed to fetch unread count:", err);
            setUnreadCount(0); // Set to 0 on error instead of keeping old value
        } finally {
            setIsLoading(false);
        }
    }, [effectiveScope, effectiveBusinessId, effectiveType, getUnreadCount]);

    const markAsRead = useCallback(
        async (applicationType?: "user_applied" | "business_invited") => {
            try {
                setError(null);
                // If type is provided, use it; otherwise use effectiveType;
                // if neither, determine based on scope
                const typeToMark = applicationType ?? effectiveType ??
                    (effectiveScope === "business" ? "user_applied" : "business_invited");

                await markApplicationsAsRead(typeToMark, {
                    scope: effectiveScope,
                    businessId: effectiveBusinessId
                });
                await fetchUnreadCount();
            } catch (err: any) {
                const message = err?.message || "Failed to mark as read";
                setError(message);
                console.error("Failed to mark as read:", err);
                throw err;
            }
        },
        [effectiveScope, effectiveBusinessId, effectiveType, markApplicationsAsRead, fetchUnreadCount]
    );

    useEffect(() => {
        fetchUnreadCount();
    }, [fetchUnreadCount]);

    useEffect(() => {
        if (!autoRefresh) return;

        const interval = setInterval(() => {
            fetchUnreadCount();
        }, refreshInterval);

        return () => clearInterval(interval);
    }, [autoRefresh, refreshInterval, fetchUnreadCount]);

    return {
        unreadCount,
        isLoading,
        error,
        refresh: fetchUnreadCount,
        markAsRead,
        scope: effectiveScope,
        businessId: effectiveBusinessId,
        type: effectiveType,
    };
};

export default useUnreadApplications;
