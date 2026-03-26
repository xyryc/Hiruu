import { callService } from "@/services/callService";
import { socketService } from "@/services/socketService";
import { useAuthStore } from "@/stores/authStore";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";

const normalizeId = (value: unknown) =>
  String(value ?? "")
    .trim()
    .toLowerCase();

const ACTIVE_CALL_STATUSES = new Set(["initiated", "ringing", "ongoing"]);
const OPENABLE_PARTICIPANT_STATUSES = new Set(["invited", "ringing"]);

export const useIncomingCallListener = (enabled: boolean) => {
  const router = useRouter();
  const { user } = useAuthStore();
  const lastHandledCallIdRef = useRef<string | null>(null);
  const resolvingCallIdRef = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return;

    let incomingHandler: ((payload: any) => void) | null = null;
    let participantsHandler: ((payload: any) => void) | null = null;

    const openIncomingCall = (callId: string, roomId = "", callType: "audio" | "video" = "audio") => {
      if (!callId) return;
      if (lastHandledCallIdRef.current === callId) return;

      const callPath =
        callType === "video"
          ? "/screens/inbox/video-call"
          : "/screens/inbox/audio-call";
      lastHandledCallIdRef.current = callId;
      router.push({
        pathname: callPath,
        params: {
          callId,
          roomId,
          mode: "incoming",
          callType,
        },
      });
    };

    const resolveAndOpenIfReceiver = async (callId: string, roomId = "") => {
      if (!callId || !user?.id) return;
      if (resolvingCallIdRef.current === callId) return;
      if (lastHandledCallIdRef.current === callId) return;

      resolvingCallIdRef.current = callId;
      try {
        const response = await callService.getCallById(callId);
        const call = response?.data || {};
        const callStatus = String(call?.status || "").toLowerCase();
        const participants = Array.isArray(call?.participants) ? call.participants : [];
        const currentUserId = normalizeId(user.id);

        const me = participants.find(
          (item: any) => normalizeId(item?.userId) === currentUserId
        );
        const myRole = String(me?.role || "").toLowerCase();
        const myStatus = String(me?.status || "").toLowerCase();

        if (!ACTIVE_CALL_STATUSES.has(callStatus)) return;

        const shouldOpen =
          myRole === "receiver" && OPENABLE_PARTICIPANT_STATUSES.has(myStatus);

        if (shouldOpen) {
          const callType = String(call?.type || "").toLowerCase() === "video" ? "video" : "audio";
          openIncomingCall(callId, roomId || call?.chatRoomId || "", callType);
        }
      } catch (error) {
        console.error("[IncomingCallListener] resolve error:", { callId, error });
      } finally {
        if (resolvingCallIdRef.current === callId) {
          resolvingCallIdRef.current = null;
        }
      }
    };

    const setup = async () => {
      try {
        await socketService.connectCalls();

        incomingHandler = (payload: any) => {
          const call = payload?.call || payload?.data || payload;
          const callId = call?.callId || call?.id;
          const roomId = call?.chatRoomId || call?.roomId || "";
          void resolveAndOpenIfReceiver(callId, roomId);
        };

        participantsHandler = (payload: any) => {
          const callId = payload?.callId;
          if (!callId) return;
          void resolveAndOpenIfReceiver(callId);
        };

        socketService.onIncomingCall(incomingHandler);
        socketService.onCallParticipants(participantsHandler);
      } catch (error) {
        console.error("[IncomingCallListener] socket connect error:", error);
      }
    };

    setup();

    return () => {
      if (incomingHandler) socketService.offIncomingCall(incomingHandler);
      if (participantsHandler) socketService.offCallParticipants(participantsHandler);
    };
  }, [enabled, router, user?.id]);
};
