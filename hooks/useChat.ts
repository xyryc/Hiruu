import type { ChatUploadMedia } from '@/services/chatService';
import { chatService } from '@/services/chatService';
import { socketService } from '@/services/socketService';
import { useAuthStore } from '@/stores/authStore';
import { useCallback, useEffect, useRef, useState } from 'react';

interface Message {
    id: string;
    content: string;
    senderId: string;
    chatRoomId: string;
    status: 'sent' | 'delivered' | 'read' | 'failed';
    createdAt: string;
    type?: string;
    attachments?: {
        url?: string;
        uri?: string;
        type?: string;
        fileName?: string;
        mimeType?: string;
    }[];
    sender?: {
        id: string;
        name: string;
        avatar?: string;
    };
    uploadState?: 'uploading' | 'failed';
    retryPayload?: SendMessageInput;
}

interface UseChatOptions {
    roomId: string;
    onError?: (error: Error) => void;
}

interface SendMessageInput {
    content?: string;
    media?: ChatUploadMedia[];
}

export const useChat = ({ roomId, onError }: UseChatOptions) => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState<string | null>(null);
    const [connected, setConnected] = useState(false);
    const { user } = useAuthStore();
    const isMounted = useRef(true);
    const messagesRef = useRef<Message[]>([]);
    const typingResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const currentUserDisplayName = [user?.firstName, user?.lastName]
        .filter(Boolean)
        .join(' ')
        .trim() || user?.email || 'You';

    const extractCallBody = useCallback((payload: any) => {
        if (!payload) return null;
        return payload.call || payload.callData || payload.callMeta || payload.metadata?.call || null;
    }, []);

    const extractMessagesFromResult = useCallback((result: any): any[] => {
        const candidates = [
            result?.data?.data,
            result?.data?.messages,
            result?.data?.items,
            result?.data,
            result?.messages,
            result?.items,
        ];

        const firstArray = candidates.find((item) => Array.isArray(item));
        return Array.isArray(firstArray) ? firstArray : [];
    }, []);

    // Load initial messages
    const loadMessages = useCallback(async () => {
        if (!roomId) return;

        try {
            setLoading(true);
            const result = await chatService.getRoomMessages(roomId);
            const data = extractMessagesFromResult(result);

            // console.log('[CHAT_DEBUG] load-messages:body', data);
            const callBodies = Array.isArray(data)
                ? data
                    .map((message: any) => extractCallBody(message))
                    .filter(Boolean)
                : [];
            if (callBodies.length) {
            }

            if (isMounted.current) {
                setMessages(Array.isArray(data) ? data.reverse() : []);
            }
        } catch (error) {
            console.error('Failed to load messages:', error);
            if (onError) {
                onError(error as Error);
            }
        } finally {
            if (isMounted.current) {
                setLoading(false);
            }
        }
    }, [roomId, onError, extractMessagesFromResult, extractCallBody]);

    const clearTypingState = useCallback(() => {
        setIsTyping(false);
        setTypingUser(null);
        if (typingResetTimeoutRef.current) {
            clearTimeout(typingResetTimeoutRef.current);
            typingResetTimeoutRef.current = null;
        }
    }, []);

    const scheduleTypingReset = useCallback(() => {
        if (typingResetTimeoutRef.current) {
            clearTimeout(typingResetTimeoutRef.current);
        }
        typingResetTimeoutRef.current = setTimeout(() => {
            clearTypingState();
        }, 2000);
    }, [clearTypingState]);

    useEffect(() => {
        messagesRef.current = messages;
    }, [messages]);

    const replaceTempMessage = useCallback((tempId: string, serverMessage?: any) => {
        setMessages((prev) => {
            const withoutTemp = prev.filter((msg) => msg.id !== tempId);
            if (!serverMessage?.id) {
                return withoutTemp;
            }
            if (withoutTemp.some((msg) => msg.id === serverMessage.id)) {
                return withoutTemp;
            }
            return [serverMessage, ...withoutTemp];
        });
    }, []);

    const markTempMessageFailed = useCallback((tempId: string) => {
        setMessages((prev) =>
            prev.map((msg) =>
                msg.id === tempId
                    ? { ...msg, status: 'failed', uploadState: 'failed' }
                    : msg
            )
        );
    }, []);

    const buildTempMediaMessage = useCallback(
        (tempId: string, input: SendMessageInput): Message => {
            const media = Array.isArray(input.media) ? input.media : [];
            const attachments = media.map((file) => {
                const mime = String(file?.type || '').toLowerCase();
                const type = mime.startsWith('video') ? 'video' : 'image';
                return {
                    url: file?.uri,
                    uri: file?.uri,
                    type,
                    fileName: file?.name,
                    mimeType: file?.type,
                };
            });

            return {
                id: tempId,
                content: input.content?.trim() || '',
                senderId: user?.id || '',
                chatRoomId: roomId,
                status: 'sent',
                type: media.length > 0 ? 'media' : 'text',
                attachments,
                createdAt: new Date().toISOString(),
                sender: {
                    id: user?.id || '',
                    name: currentUserDisplayName,
                    avatar: user?.avatar,
                },
                uploadState: 'uploading',
                retryPayload: {
                    content: input.content?.trim() || '',
                    media,
                },
            };
        },
        [roomId, user?.avatar, user?.id, currentUserDisplayName]
    );

    // Send message
    const sendMessage = useCallback(
        async (input: SendMessageInput): Promise<boolean> => {
            const content = input.content?.trim() || '';
            const media = Array.isArray(input.media) ? input.media : [];
            const hasContent = Boolean(content);
            const hasMedia = media.length > 0;

            if ((!hasContent && !hasMedia) || !roomId || sending) {
                return false;
            }

            if (hasMedia) {
                const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
                const tempMessage = buildTempMediaMessage(tempId, input);
                setMessages((prev) => [tempMessage, ...prev]);

                void (async () => {
                    try {
                        const result = await chatService.sendMessage(roomId, {
                            content,
                            media,
                        });
                        replaceTempMessage(tempId, result?.data);
                    } catch (error) {
                        console.error('Failed to upload media message:', error);
                        markTempMessageFailed(tempId);
                        if (onError) {
                            onError(error as Error);
                        }
                    } finally {
                        clearTypingState();
                    }
                })();

                return true;
            }

            try {
                setSending(true);
                if (socketService.isConnected()) {
                    socketService.sendMessage({
                        chatRoomId: roomId,
                        content,
                    });
                } else {
                    await chatService.sendMessage(roomId, {
                        content,
                        media,
                    });
                }

                return true;
            } catch (error) {
                console.error('Failed to send message:', error);
                if (onError) {
                    onError(error as Error);
                }
                return false;
            } finally {
                setSending(false);
                clearTypingState();
            }
        },
        [
            roomId,
            sending,
            onError,
            clearTypingState,
            buildTempMediaMessage,
            markTempMessageFailed,
            replaceTempMessage,
        ]
    );

    const retryFailedMessage = useCallback(
        async (messageId: string): Promise<boolean> => {
            if (!roomId) return false;

            const target = messagesRef.current.find((msg) => msg.id === messageId);
            const payload = target?.retryPayload;

            if (!target || !payload || !Array.isArray(payload.media) || payload.media.length === 0) {
                return false;
            }

            setMessages((prev) =>
                prev.map((msg) =>
                    msg.id === messageId
                        ? { ...msg, status: 'sent', uploadState: 'uploading' }
                        : msg
                )
            );

            try {
                const result = await chatService.sendMessage(roomId, payload);
                replaceTempMessage(messageId, result?.data);
                return true;
            } catch (error) {
                console.error('Retry media upload failed:', error);
                markTempMessageFailed(messageId);
                if (onError) {
                    onError(error as Error);
                }
                return false;
            }
        },
        [roomId, onError, markTempMessageFailed, replaceTempMessage]
    );

    // Typing indicators
    const startTyping = useCallback(() => {
        if (socketService.isConnected() && roomId) {
            socketService.startTyping(roomId);
        }
    }, [roomId]);

    const stopTyping = useCallback(() => {
        if (socketService.isConnected() && roomId) {
            socketService.stopTyping(roomId);
        }
    }, [roomId]);

    // Setup Socket.IO connection and event listeners
    useEffect(() => {
        // Don't setup if no room ID
        if (!roomId) {
            return;
        }

        isMounted.current = true;
        let hasJoinedRoom = false;
        let handlers: any = null;

        const setupSocket = async () => {
            try {
                const socket = await socketService.connect();
                const handleSocketConnect = () => {
                    if (!isMounted.current) return;
                    setConnected(true);

                    if (!hasJoinedRoom) {
                        socketService.joinChat(roomId);
                        hasJoinedRoom = true;
                    }
                };

                const handleSocketDisconnect = () => {
                    if (!isMounted.current) return;
                    setConnected(false);
                    hasJoinedRoom = false;
                };

                socket.on('connect', handleSocketConnect);
                socket.on('disconnect', handleSocketDisconnect);

                if (socket.connected) {
                    handleSocketConnect();
                } else if (isMounted.current) {
                    setConnected(false);
                }

                // Listen for new messages
                const handleNewMessage = (data: any) => {
                    const incomingMessage = data?.message || data;
                    const eventRoomId =
                        data?.chatRoomId ||
                        data?.roomId ||
                        data?.chatId ||
                        incomingMessage?.chatRoomId;
                    const callBody = extractCallBody(incomingMessage);
                    if (callBody) {
                    }

                    if (eventRoomId === roomId) {
                        const normalizedMessage =
                            incomingMessage?.chatRoomId
                                ? incomingMessage
                                : { ...incomingMessage, chatRoomId: eventRoomId };

                        clearTypingState();
                        setMessages((prev) => {
                            // Add new message if not already present
                            if (!prev.some((msg) => msg.id === normalizedMessage.id)) {
                                return [normalizedMessage, ...prev];
                            }
                            return prev;
                        });
                    }
                };

                // Listen for typing indicators
                const handleUserTyping = (data: any) => {
                    const payload = data || {};
                    const typingUserId =
                        payload.userId ||
                        payload.senderId ||
                        payload.user?.id ||
                        payload.sender?.id;

                    // Ignore own typing events even if backend shape changes.
                    if (typingUserId && typingUserId === user?.id) {
                        return;
                    }

                    const eventRoomId = payload.chatRoomId || payload.roomId || payload.chatId;
                    if (!eventRoomId || eventRoomId !== roomId) {
                        return;
                    }

                    const isUserTyping = payload.isTyping !== false && payload.typing !== false;
                    if (isUserTyping) {
                        setIsTyping(true);
                        setTypingUser(
                            payload.userName ||
                            payload.name ||
                            payload.user?.name ||
                            payload.sender?.name ||
                            'Someone'
                        );
                        scheduleTypingReset();
                    } else {
                        clearTypingState();
                    }
                };

                // Listen for explicit stop-typing event when backend emits it.
                const handleTypingStop = (data: any) => {
                    const payload = data || {};
                    const eventRoomId = payload.chatRoomId || payload.roomId || payload.chatId;
                    if (!eventRoomId || eventRoomId !== roomId) {
                        return;
                    }

                    const typingUserId =
                        payload.userId ||
                        payload.senderId ||
                        payload.user?.id ||
                        payload.sender?.id;

                    if (typingUserId && typingUserId === user?.id) {
                        return;
                    }

                    clearTypingState();
                };

                const handleError = (error: any) => {
                    console.error('Socket error in chat:', error.message || error);
                    if (onError) {
                        onError(new Error(error.message || 'Socket error occurred'));
                    }
                };

                socketService.onNewMessage(handleNewMessage);
                socketService.onUserTyping(handleUserTyping);
                socket.on('typing_stop', handleTypingStop);
                socket.on('error', handleError);

                handlers = {
                    handleSocketConnect,
                    handleSocketDisconnect,
                    handleNewMessage,
                    handleUserTyping,
                    handleTypingStop,
                    handleError,
                };
            } catch (error) {
                console.error('Socket setup error:', error);
                setConnected(false);
            }
        };

        // Setup socket and load messages once
        setupSocket();
        loadMessages();

        return () => {
            isMounted.current = false;

            // Leave chat room only if we joined
            if (hasJoinedRoom) {
                socketService.leaveChat(roomId);
            }

            // Remove event listeners with specific handlers
            if (handlers) {
                socketService.getSocket()?.off('connect', handlers.handleSocketConnect);
                socketService.getSocket()?.off('disconnect', handlers.handleSocketDisconnect);
                socketService.offNewMessage(handlers.handleNewMessage);
                socketService.offUserTyping(handlers.handleUserTyping);
                socketService.getSocket()?.off('typing_stop', handlers.handleTypingStop);
                socketService.getSocket()?.off('error', handlers.handleError);
            }
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [roomId, user?.id, clearTypingState, scheduleTypingReset, extractCallBody]);

    useEffect(() => {
        return () => {
            if (typingResetTimeoutRef.current) {
                clearTimeout(typingResetTimeoutRef.current);
                typingResetTimeoutRef.current = null;
            }
        };
    }, []);

    return {
        messages,
        loading,
        sending,
        connected,
        isTyping,
        typingUser,
        sendMessage,
        retryFailedMessage,
        startTyping,
        stopTyping,
        refreshMessages: loadMessages,
    };
};
