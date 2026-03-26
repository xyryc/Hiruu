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
    console.log("[CALL_DEBUG][INCOMING] listener:enabled", { userId: user?.id });

    let incomingHandler: ((payload: any) => void) | null = null;
    let participantsHandler: ((payload: any) => void) | null = null;

    const openIncomingCall = (callId: string, roomId = "", callType: "audio" | "video" = "audio") => {
      if (!callId) return;
      if (lastHandledCallIdRef.current === callId) return;

      const callPath =
        callType === "video"
          ? "/screens/inbox/video-call"
          : "/screens/inbox/audio-call";
      console.log("[CALL_DEBUG][INCOMING] navigate:call-screen", { callId, roomId, callType });
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

        console.log("[CALL_DEBUG][INCOMING] resolve", {
          callId,
          callStatus,
          myRole,
          myStatus,
          shouldOpen,
          roomId,
        });

        if (shouldOpen) {
          const callType = String(call?.type || "").toLowerCase() === "video" ? "video" : "audio";
          openIncomingCall(callId, roomId || call?.chatRoomId || "", callType);
        }
      } catch (error) {
        console.log("[CALL_DEBUG][INCOMING] resolve:error", { callId, error });
      } finally {
        if (resolvingCallIdRef.current === callId) {
          resolvingCallIdRef.current = null;
        }
      }
    };

    const setup = async () => {
      try {
        console.log("[CALL_DEBUG][INCOMING] socket:connect:start");
        await socketService.connectCalls();
        console.log("[CALL_DEBUG][INCOMING] socket:connect:ok");

        incomingHandler = (payload: any) => {
          console.log("[CALL_DEBUG][INCOMING] event:incoming_call", payload);
          const call = payload?.call || payload?.data || payload;
          const callId = call?.callId || call?.id;
          const roomId = call?.chatRoomId || call?.roomId || "";
          void resolveAndOpenIfReceiver(callId, roomId);
        };

        participantsHandler = (payload: any) => {
          console.log("[CALL_DEBUG][INCOMING] event:call_participants", payload);
          const callId = payload?.callId;
          if (!callId) return;
          void resolveAndOpenIfReceiver(callId);
        };

        socketService.onIncomingCall(incomingHandler);
        socketService.onCallParticipants(participantsHandler);
      } catch (error) {
        console.log("[CALL_DEBUG][INCOMING] socket:connect:error", error);
      }
    };

    setup();

    return () => {
      console.log("[CALL_DEBUG][INCOMING] listener:cleanup");
      if (incomingHandler) socketService.offIncomingCall(incomingHandler);
      if (participantsHandler) socketService.offCallParticipants(participantsHandler);
    };
  }, [enabled, router, user?.id]);
};
