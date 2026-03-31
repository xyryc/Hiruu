import { useJobStore } from "@/stores/jobStore";
import React, { useEffect, useState } from "react";
import { Text, View } from "react-native";

type UnreadBadgeProps = {
    scope?: "user" | "business";
    businessId?: string;
    type?: "user_applied" | "business_invited";
    className?: string;
};

export const UnreadBadge = ({
    scope = "user",
    businessId,
    type,
    className,
}: UnreadBadgeProps) => {
    const [unreadCount, setUnreadCount] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const getUnreadCount = useJobStore((s) => s.getUnreadCount);

    useEffect(() => {
        const fetchUnreadCount = async () => {
            try {
                setIsLoading(true);
                const result = await getUnreadCount({ scope, businessId, type });
                setUnreadCount(result.totalUnread);
            } catch (error) {
                console.error("Failed to fetch unread count:", error);
                setUnreadCount(0);
            } finally {
                setIsLoading(false);
            }
        };

        fetchUnreadCount();
    }, [scope, businessId, type, getUnreadCount]);

    if (isLoading || unreadCount === 0) {
        return null;
    }

    return (
        <View
            className={`bg-red-500 rounded-full min-w-[20px] h-5 items-center justify-center px-1.5 ${className}`}
        >
            <Text className="text-white text-xs font-proximanova-semibold">
                {unreadCount > 99 ? "99+" : unreadCount}
            </Text>
        </View>
    );
};
