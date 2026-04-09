import axiosInstance from "@/utils/axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface ChatUploadMedia {
  uri: string;
  type: string;
  name: string;
}

class ChatService {
  private roomDeletedListeners = new Set<(roomId: string) => void>();

  private extractRoomId(payload: any): string {
    return (
      payload?.id ||
      payload?.chatRoomId ||
      payload?.roomId ||
      payload?.chatRoom?.id ||
      ""
    );
  }

  private extractChatRooms(result: any): any[] {
    const directListCandidates = [
      result?.data?.data,
      result?.data?.rooms,
      result?.data?.items,
      result?.data,
      result?.rooms,
      result?.items,
    ];

    const firstArray = directListCandidates.find((item) => Array.isArray(item));
    return Array.isArray(firstArray) ? firstArray : [];
  }

  private isApiSuccess(result: any): boolean {
    if (typeof result?.success === "boolean") {
      return result.success;
    }
    if (typeof result?.statusCode === "number") {
      return result.statusCode >= 200 && result.statusCode < 300;
    }
    return true;
  }

  async getChatRooms(): Promise<any> {
    try {
      const response = await axiosInstance.get("/chat/rooms");
      const result = response.data;

      if (!this.isApiSuccess(result)) {
        throw new Error(result?.message || "Failed to load chats");
      }

      return result;
    } catch (error: any) {
      throw new Error(error?.message || "Failed to load chats");
    }
  }

  async getUnreadCount(): Promise<number> {
    try {
      const response = await axiosInstance.get("/chat/unread-count");
      const result = response.data;

      if (!this.isApiSuccess(result)) {
        throw new Error(result?.message || "Failed to load unread count");
      }

      const count = Number(result?.data?.count ?? 0);
      return Number.isFinite(count) && count > 0 ? count : 0;
    } catch (error: any) {
      throw new Error(error?.message || "Failed to load unread count");
    }
  }

  async getRoomMessages(roomId: string, page = 1, limit = 50): Promise<any> {
    try {
      const response = await axiosInstance.get(`/chat/rooms/${roomId}/messages`, {
        params: { page, limit }
      });
      const result = response.data;

      if (!this.isApiSuccess(result)) {
        throw new Error(result?.message || "Failed to load messages");
      }

      return result;
    } catch (error: any) {
      throw new Error(error?.message || "Failed to load messages");
    }
  }

  async getChatRoom(roomId: string): Promise<any> {
    try {
      const response = await axiosInstance.get(`/chat/rooms/${roomId}`);
      const result = response.data;

      if (!this.isApiSuccess(result)) {
        throw new Error(result?.message || "Failed to load chat room");
      }

      return result;
    } catch (error: any) {
      throw new Error(error?.message || "Failed to load chat room");
    }
  }

  async sendMessage(roomId: string, data: {
    content?: string;
    replyToId?: string;
    mentions?: string[];
    media?: ChatUploadMedia[];
  }): Promise<any> {
    try {
      const hasMedia = Array.isArray(data.media) && data.media.length > 0;

      if (!hasMedia) {
        const response = await axiosInstance.post(`/chat/rooms/${roomId}/messages`, {
          content: data.content?.trim() || "",
          replyToId: data.replyToId,
          mentions: data.mentions,
        });
        const result = response.data;

        if (!this.isApiSuccess(result)) {
          throw new Error(result?.message || "Failed to send message");
        }

        return result;
      }

      const baseUrl = process.env.EXPO_PUBLIC_API_URL;
      if (!baseUrl) {
        throw new Error("API URL not configured");
      }

      const formData = new FormData();

      if (data.content?.trim()) {
        formData.append("content", data.content.trim());
      }
      if (data.replyToId) {
        formData.append("replyToId", data.replyToId);
      }
      if (Array.isArray(data.mentions) && data.mentions.length > 0) {
        formData.append("mentions", JSON.stringify(data.mentions));
      }

      data.media?.forEach((file, index) => {
        const fallbackName = `upload-${Date.now()}-${index}`;
        formData.append("media", {
          uri: file.uri,
          type: file.type || "application/octet-stream",
          name: file.name || fallbackName,
        } as any);
      });

      const accessToken = await AsyncStorage.getItem("auth_access_token");
      const uploadResponse = await fetch(`${baseUrl}/chat/rooms/${roomId}/messages`, {
        method: "POST",
        headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : undefined,
        body: formData,
      });

      const responseText = await uploadResponse.text();
      let result: any = null;
      try {
        result = responseText ? JSON.parse(responseText) : null;
      } catch {
        result = { success: false, message: responseText || "Failed to send message" };
      }

      if (!uploadResponse.ok || !this.isApiSuccess(result)) {
        throw new Error(result?.message || "Failed to send message");
      }

      return result;
    } catch (error: any) {
      if (error?.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error(error?.message || "Failed to send message");
    }
  }

  async markAsRead(messageId: string): Promise<any> {
    try {
      const response = await axiosInstance.patch(`/chat/messages/${messageId}/read`);
      const result = response.data;

      if (!this.isApiSuccess(result)) {
        throw new Error(result?.message || "Failed to mark as read");
      }

      return result;
    } catch (error: any) {
      throw new Error(error?.message || "Failed to mark as read");
    }
  }

  async markRoomAsRead(roomId: string): Promise<any> {
    try {
      const response = await axiosInstance.patch(`/chat/rooms/${roomId}/read`);
      const result = response.data;

      if (!this.isApiSuccess(result)) {
        throw new Error(result?.message || "Failed to mark room as read");
      }

      return result;
    } catch (error: any) {
      throw new Error(error?.message || "Failed to mark room as read");
    }
  }

  async createDirectChat(
    participantId: string,
    options?: { referenceRecruitmentId?: string; businessId?: string | null }
  ): Promise<any> {
    try {
      const response = await axiosInstance.post("/chat/rooms", {
        type: "direct",
        participantIds: [participantId],
        ...(options?.referenceRecruitmentId
          ? { referenceRecruitmentId: options.referenceRecruitmentId }
          : {}),
        ...(typeof options?.businessId !== "undefined"
          ? { businessId: options.businessId }
          : {}),
      });
      const result = response.data;

      if (!this.isApiSuccess(result)) {
        throw new Error(result?.message || "Failed to create chat");
      }

      return result;
    } catch (error: any) {
      throw new Error(error?.message || "Failed to create chat");
    }
  }

  async createSupportChat(): Promise<{ roomId: string; room?: any }> {
    try {
      const existingRoomsResult = await this.getChatRooms();
      const existingSupportRoom = this.extractChatRooms(existingRoomsResult).find(
        (room) =>
          String(room?.type || "").toLowerCase() === "support" &&
          room?.isActive !== false &&
          this.extractRoomId(room)
      );

      if (existingSupportRoom) {
        return {
          roomId: this.extractRoomId(existingSupportRoom),
          room: existingSupportRoom,
        };
      }

      const response = await axiosInstance.post("/chat/rooms", {
        type: "support",
      });
      const result = response.data;

      if (!this.isApiSuccess(result)) {
        throw new Error(result?.message || "Failed to open support chat");
      }

      const room = result?.data ?? null;
      const roomId = this.extractRoomId(room) || this.extractRoomId(result);

      if (!roomId) {
        throw new Error("Support chat room id not found");
      }

      return { roomId, room };
    } catch (error: any) {
      throw new Error(error?.message || "Failed to open support chat");
    }
  }

  onRoomDeleted(callback: (roomId: string) => void): () => void {
    this.roomDeletedListeners.add(callback);
    return () => {
      this.roomDeletedListeners.delete(callback);
    };
  }

  private emitRoomDeleted(roomId: string) {
    for (const listener of this.roomDeletedListeners) {
      listener(roomId);
    }
  }

  async blockUser(userId: string): Promise<any> {
    try {
      const response = await axiosInstance.post("/users/block", { userId });
      const result = response.data;

      if (!this.isApiSuccess(result)) {
        throw new Error(result?.message || "Failed to block user");
      }

      return result;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || error?.message || "Failed to block user"
      );
    }
  }

  async unblockUser(userId: string): Promise<any> {
    try {
      const response = await axiosInstance.post("/users/unblock", { userId });
      const result = response.data;

      if (!this.isApiSuccess(result)) {
        throw new Error(result?.message || "Failed to unblock user");
      }

      return result;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || error?.message || "Failed to unblock user"
      );
    }
  }

  async hardDeleteChatRoom(roomId: string): Promise<any> {
    try {
      const response = await axiosInstance.delete(`/chat/rooms/${roomId}/hard-delete`);
      const result = response.data;

      if (!this.isApiSuccess(result)) {
        throw new Error(result?.message || "Failed to delete conversation");
      }

      this.emitRoomDeleted(roomId);

      return result;
    } catch (error: any) {
      throw new Error(
        error?.response?.data?.message || error?.message || "Failed to delete conversation"
      );
    }
  }
}

export const chatService = new ChatService();
