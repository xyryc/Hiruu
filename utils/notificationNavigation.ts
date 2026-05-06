type PendingChatNavigation = {
  chatRoomId: string;
  messageId?: string;
};

let pendingChatNavigation: PendingChatNavigation | null = null;
let pendingRouteNavigation:
  | {
      pathname: string;
      params?: Record<string, string>;
    }
  | null = null;

export const setPendingChatNavigation = (payload: PendingChatNavigation) => {
  pendingChatNavigation = payload;
};

export const consumePendingChatNavigation = (): PendingChatNavigation | null => {
  const next = pendingChatNavigation;
  pendingChatNavigation = null;
  return next;
};

export const peekPendingChatNavigation = (): PendingChatNavigation | null =>
  pendingChatNavigation;

export const setPendingRouteNavigation = (payload: {
  pathname: string;
  params?: Record<string, string>;
}) => {
  pendingRouteNavigation = payload;
};

export const consumePendingRouteNavigation = (): {
  pathname: string;
  params?: Record<string, string>;
} | null => {
  const next = pendingRouteNavigation;
  pendingRouteNavigation = null;
  return next;
};
