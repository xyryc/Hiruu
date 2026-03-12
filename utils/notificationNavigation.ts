type PendingChatNavigation = {
  chatRoomId: string;
  messageId?: string;
};

let pendingChatNavigation: PendingChatNavigation | null = null;

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
