import AsyncStorage from '@react-native-async-storage/async-storage';
import { io, Socket } from 'socket.io-client';

class SocketService {
    private socket: Socket | null = null;
    private callsSocket: Socket | null = null;
    private token: string | null = null;
    private isConnecting: boolean = false;
    private isCallsConnecting: boolean = false;
    private isServerUnavailableError(error: any): boolean {
        const message = String(error?.message || '').toLowerCase();
        return (
            message.includes('websocket error') ||
            message.includes('xhr poll error') ||
            message.includes('network error') ||
            message.includes('failed')
        );
    }

    async connect(): Promise<Socket | null> {
        // Return existing connection
        if (this.socket?.connected) {
            return this.socket;
        }

        // Reuse existing socket instance instead of creating duplicates.
        if (this.socket) {
            if (!this.socket.active) {
                this.socket.connect();
            }
            return this.socket;
        }

        // Prevent concurrent connection attempts
        if (this.isConnecting) {
            // Wait for existing connection attempt
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this.isConnecting) {
                        clearInterval(checkInterval);
                        resolve(this.socket);
                    }
                }, 100);
            });
        }

        this.isConnecting = true;

        try {
            this.token = await AsyncStorage.getItem('auth_access_token');
            let baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
            baseURL = baseURL.replace(/\/api\/v1\/?$/, '');


            this.socket = io(`${baseURL}/chat`, {
                auth: { token: this.token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
            });

            this.socket.on('connect', () => {
                this.isConnecting = false;
            });

            this.socket.on('connect_error', (error) => {
                if (this.isServerUnavailableError(error)) {
                    console.warn('Chat socket unavailable: server is offline or unreachable.');
                } else {
                    console.error('Socket connection error:', {
                        message: error?.message,
                    });
                }
                this.isConnecting = false;
            });

            this.socket.on('error', (error) => {
                console.error('❌ Socket error:', error);
            });

            this.socket.on('disconnect', (reason) => {
                this.isConnecting = false;
            });

            return this.socket;
        } catch (error) {
            console.error('❌ Failed to connect socket:', error);
            this.isConnecting = false;
            return null;
        }
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        if (this.callsSocket) {
            this.callsSocket.disconnect();
            this.callsSocket = null;
        }
        this.token = null;
        this.isConnecting = false;
        this.isCallsConnecting = false;
    }

    getSocket(): Socket | null {
        return this.socket;
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }

    async connectCalls(): Promise<Socket | null> {
        if (this.callsSocket?.connected) {
            return this.callsSocket;
        }

        // Reuse existing calls socket instance instead of creating duplicates.
        if (this.callsSocket) {
            if (!this.callsSocket.active) {
                this.callsSocket.connect();
            }
            return this.callsSocket;
        }

        if (this.isCallsConnecting) {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!this.isCallsConnecting) {
                        clearInterval(checkInterval);
                        resolve(this.callsSocket);
                    }
                }, 100);
            });
        }

        this.isCallsConnecting = true;

        try {
            this.token = this.token || await AsyncStorage.getItem('auth_access_token');
            let baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';
            baseURL = baseURL.replace(/\/api\/v1\/?$/, '');

            this.callsSocket = io(`${baseURL}/calls`, {
                auth: { token: this.token },
                transports: ['websocket'],
                reconnection: true,
                reconnectionDelay: 1000,
                reconnectionDelayMax: 5000,
                reconnectionAttempts: 5,
            });

            this.callsSocket.on('connect', () => {
                this.isCallsConnecting = false;
            });

            this.callsSocket.on('connect_error', (error) => {
                if (this.isServerUnavailableError(error)) {
                    console.warn('Calls socket unavailable: server is offline or unreachable.');
                } else {
                    console.error('Calls socket connection error:', {
                        message: error?.message,
                    });
                }
                this.isCallsConnecting = false;
            });

            this.callsSocket.on('disconnect', (reason) => {
                this.isCallsConnecting = false;
            });

            return this.callsSocket;
        } catch (error) {
            this.isCallsConnecting = false;
            console.error('Calls socket connection failed:', error);
            return null;
        }
    }

    joinChat(chatRoomId: string) {
        if (!this.socket?.connected) return;
        this.socket.emit('join_chat', { chatRoomId });
    }

    leaveChat(chatRoomId: string) {
        if (!this.socket?.connected) return;
        this.socket.emit('leave_chat', { chatRoomId });
    }

    sendMessage(data: { chatRoomId: string; content: string }) {
        if (!this.socket?.connected) {
            console.error('❌ Socket not connected');
            return;
        }

        const payload = {
            chatRoomId: data.chatRoomId,
            content: data.content,
        };


        this.socket.emit('send_message', payload);
    }

    startTyping(chatRoomId: string) {
        if (!this.socket?.connected) return;
        this.socket.emit('typing_start', { chatRoomId });
    }

    stopTyping(chatRoomId: string) {
        if (!this.socket?.connected) return;
        this.socket.emit('typing_stop', { chatRoomId });
    }

    markAsRead(chatRoomId: string, messageId?: string) {
        if (!this.socket?.connected) return;
        this.socket.emit('mark_as_read', { chatRoomId, messageId });
    }

    onNewMessage(callback: (data: any) => void) {
        this.socket?.on('new_message', callback);
    }

    onUserTyping(callback: (data: any) => void) {
        this.socket?.on('user_typing', callback);
    }

    onMessageRead(callback: (data: any) => void) {
        this.socket?.on('message_read', callback);
    }

    offNewMessage(callback?: (data: any) => void) {
        this.socket?.off('new_message', callback);
    }

    offUserTyping(callback?: (data: any) => void) {
        this.socket?.off('user_typing', callback);
    }

    offMessageRead(callback?: (data: any) => void) {
        this.socket?.off('message_read', callback);
    }

    getCallsSocket(): Socket | null {
        return this.callsSocket;
    }

    onIncomingCall(callback: (data: any) => void) {
        this.callsSocket?.on('incoming_call', callback);
    }

    offIncomingCall(callback?: (data: any) => void) {
        this.callsSocket?.off('incoming_call', callback);
    }

    onCallEnded(callback: (data: any) => void) {
        this.callsSocket?.on('call_ended', callback);
    }

    offCallEnded(callback?: (data: any) => void) {
        this.callsSocket?.off('call_ended', callback);
    }

    joinCall(callId: string) {
        if (!this.callsSocket?.connected) return;
        this.callsSocket.emit('join_call', { callId });
    }

    leaveCall(callId: string) {
        if (!this.callsSocket?.connected) return;
        this.callsSocket.emit('leave_call', { callId });
    }

    changeCallStatus(callId: string, status: string, reason?: string) {
        if (!this.callsSocket?.connected) return;
        this.callsSocket.emit('call_status_changed', { callId, status, reason });
    }

    changeMediaState(callId: string, isMicMuted: boolean, isCameraOff = true, isSharingScreen = false) {
        if (!this.callsSocket?.connected) return;
        this.callsSocket.emit('media_state_changed', {
            callId,
            isMicMuted,
            isCameraOff,
            isSharingScreen,
        });
    }

    onCallParticipants(callback: (data: any) => void) {
        this.callsSocket?.on('call_participants', callback);
    }

    offCallParticipants(callback?: (data: any) => void) {
        this.callsSocket?.off('call_participants', callback);
    }

    onParticipantJoined(callback: (data: any) => void) {
        this.callsSocket?.on('participant_joined', callback);
    }

    offParticipantJoined(callback?: (data: any) => void) {
        this.callsSocket?.off('participant_joined', callback);
    }

    onParticipantLeft(callback: (data: any) => void) {
        this.callsSocket?.on('participant_left', callback);
    }

    offParticipantLeft(callback?: (data: any) => void) {
        this.callsSocket?.off('participant_left', callback);
    }

    onParticipantDisconnected(callback: (data: any) => void) {
        this.callsSocket?.on('participant_disconnected', callback);
    }

    offParticipantDisconnected(callback?: (data: any) => void) {
        this.callsSocket?.off('participant_disconnected', callback);
    }

    onParticipantStatusChanged(callback: (data: any) => void) {
        this.callsSocket?.on('participant_status_changed', callback);
    }

    offParticipantStatusChanged(callback?: (data: any) => void) {
        this.callsSocket?.off('participant_status_changed', callback);
    }

    sendOffer(callId: string, targetUserId: string, offer: any) {
        if (!this.callsSocket?.connected) return;
        this.callsSocket.emit('offer', { callId, targetUserId, offer });
    }

    sendAnswer(callId: string, targetUserId: string, answer: any) {
        if (!this.callsSocket?.connected) return;
        this.callsSocket.emit('answer', { callId, targetUserId, answer });
    }

    sendIceCandidate(callId: string, targetUserId: string, candidate: any) {
        if (!this.callsSocket?.connected) return;
        this.callsSocket.emit('ice_candidate', { callId, targetUserId, candidate });
    }

    onOffer(callback: (data: any) => void) {
        this.callsSocket?.on('offer', callback);
    }

    offOffer(callback?: (data: any) => void) {
        this.callsSocket?.off('offer', callback);
    }

    onAnswer(callback: (data: any) => void) {
        this.callsSocket?.on('answer', callback);
    }

    offAnswer(callback?: (data: any) => void) {
        this.callsSocket?.off('answer', callback);
    }

    onIceCandidate(callback: (data: any) => void) {
        this.callsSocket?.on('ice_candidate', callback);
    }

    offIceCandidate(callback?: (data: any) => void) {
        this.callsSocket?.off('ice_candidate', callback);
    }
}

export const socketService = new SocketService();
