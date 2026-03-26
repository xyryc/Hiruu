import { callService } from "@/services/callService";
import { socketService } from "@/services/socketService";
import { useAuthStore } from "@/stores/authStore";
import {
  createAudioPlayer,
  requestRecordingPermissionsAsync,
  setAudioModeAsync,
} from "expo-audio";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { PermissionsAndroid, Platform } from "react-native";
import createAgoraRtcEngine, {
  RenderModeType,
  RtcConnection,
  RtcSurfaceView,
  RtcTextureView,
  UserOfflineReasonType,
  VideoSourceType,
} from "react-native-agora";
import { toast } from "sonner-native";

const INCOMING_RINGTONE_SOURCE = require("@/assets/sounds/phone_ring_sfx.wav");
const OUTGOING_RINGBACK_SOURCE = require("@/assets/sounds/phone_call_sfx.mp3");

type AgoraSession = {
  appId?: string;
  channelName?: string;
  rtcToken?: string;
  userAccount?: string;
};

const TERMINAL_CALL_STATUSES = new Set(["ended", "completed", "cancelled", "failed"]);
const ACTIVE_PARTICIPANT_STATUSES = new Set(["invited", "ringing", "joined"]);
const TERMINAL_PARTICIPANT_STATUSES = new Set(["left", "declined", "missed"]);

export const useCallSession = () => {
  const router = useRouter();
  const params = useLocalSearchParams<{
    callId?: string;
    mode?: "outgoing" | "incoming";
    callType?: "audio" | "video";
  }>();
  const { user } = useAuthStore();

  const callId = typeof params.callId === "string" ? params.callId : "";
  const mode = params.mode === "incoming" ? "incoming" : "outgoing";
  const initialCallType = params.callType === "video" ? "video" : "audio";
  const isInitialIncoming = mode === "incoming";

  const [joining, setJoining] = useState(isInitialIncoming);
  const [ending, setEnding] = useState(false);
  const [muted, setMuted] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [remoteJoined, setRemoteJoined] = useState(false);
  const [participantsCount, setParticipantsCount] = useState(1);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [elapsed, setElapsed] = useState(0);
  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [isIncomingPending, setIsIncomingPending] = useState(isInitialIncoming);
  const [callType, setCallType] = useState<"audio" | "video">(initialCallType);
  const [cameraOff, setCameraOff] = useState(initialCallType !== "video");
  const [localJoinedAgora, setLocalJoinedAgora] = useState(false);
  const [remoteVideoUid, setRemoteVideoUid] = useState<number | null>(null);

  const hasLeftRef = useRef(false);
  const hasClosedRef = useRef(false);
  const hasJoinedCallRoomRef = useRef(false);
  const hasAcceptedIncomingRef = useRef(false);
  const incomingToneRef = useRef<any>(null);
  const ringbackToneRef = useRef<any>(null);
  const agoraEngineRef = useRef<any>(null);
  const remoteUidsRef = useRef<Set<number>>(new Set());
  const joinedAgoraChannelRef = useRef(false);

  const isVideoCall = callType === "video";
  const RemoteVideoView = RtcSurfaceView;
  const LocalVideoView = Platform.OS === "android" ? RtcTextureView : RtcSurfaceView;

  useEffect(() => {
    const nextType = params.callType === "video" ? "video" : "audio";
    setCallType(nextType);
    setCameraOff(nextType !== "video");
  }, [params.callType]);

  const getMyParticipantStatus = (callDetails: any) => {
    const participants = Array.isArray(callDetails?.data?.participants)
      ? callDetails.data.participants
      : [];
    const me = participants.find((item: any) => item?.userId === user?.id);
    return String(me?.status || "").toLowerCase();
  };

  const stopTone = async (player: any) => {
    if (!player) return;
    try {
      if (typeof player.stop === "function") {
        player.stop();
      } else {
        player.pause?.();
        await player.seekTo?.(0);
      }
    } catch {
      // no-op
    }
  };

  const ensureIncomingTone = () => {
    if (incomingToneRef.current) return incomingToneRef.current;
    const player = createAudioPlayer(INCOMING_RINGTONE_SOURCE, {
      keepAudioSessionActive: true,
    });
    player.loop = true;
    incomingToneRef.current = player;
    return player;
  };

  const ensureRingbackTone = () => {
    if (ringbackToneRef.current) return ringbackToneRef.current;
    const player = createAudioPlayer(OUTGOING_RINGBACK_SOURCE, {
      keepAudioSessionActive: true,
    });
    player.loop = true;
    ringbackToneRef.current = player;
    return player;
  };

  const closeCallScreen = (message = "Call ended") => {
    if (hasClosedRef.current) return;
    hasClosedRef.current = true;
    toast.success(message);
    router.back();
  };

  const cleanupAgora = async () => {
    const engine = agoraEngineRef.current;
    if (!engine) return;
    try {
      if (isVideoCall) {
        engine.stopPreview?.();
        engine.disableVideo?.();
      }
      if (joinedAgoraChannelRef.current) {
        await engine.leaveChannel?.();
      }
      engine.unregisterEventHandler?.();
      engine.release?.();
    } catch {
      // no-op
    } finally {
      agoraEngineRef.current = null;
      joinedAgoraChannelRef.current = false;
      remoteUidsRef.current.clear();
      setRemoteVideoUid(null);
      setLocalJoinedAgora(false);
    }
  };

  const ensureParticipantJoined = async () => {
    if (!callId || !user?.id) throw new Error("Missing call context");

    let callDetails = await callService.getCallById(callId);
    let myStatus = getMyParticipantStatus(callDetails);
    if (myStatus === "joined") return;

    try {
      await callService.joinCall(callId, { isMicMuted: muted, isCameraOff: !isVideoCall });
    } catch {}

    callDetails = await callService.getCallById(callId);
    myStatus = getMyParticipantStatus(callDetails);
    if (myStatus === "joined") return;

    if (!TERMINAL_PARTICIPANT_STATUSES.has(myStatus)) {
      try {
        await callService.updateCallStatus(callId, "joined");
        socketService.changeCallStatus(callId, "joined", "Joined call");
      } catch {}
    }

    callDetails = await callService.getCallById(callId);
    myStatus = getMyParticipantStatus(callDetails);
    if (myStatus !== "joined") throw new Error("Failed to join media session");
  };

  const ensureAgoraJoined = async () => {
    if (!callId || !user?.id || joinedAgoraChannelRef.current) return;

    try {
      await ensureParticipantJoined();

      const micPermission = await requestRecordingPermissionsAsync();
      if (!micPermission.granted) throw new Error("Microphone permission denied");

      if (isVideoCall && Platform.OS === "android") {
        const cameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA
        );
        if (cameraPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          throw new Error("Camera permission denied");
        }
      }

      const sessionResponse = await callService.createMediaSession(callId);
      const session: AgoraSession = sessionResponse?.data || {};
      if (!session.appId || !session.channelName || !session.rtcToken) {
        throw new Error("Invalid media session response");
      }

      const engine = createAgoraRtcEngine();
      const events = {
        onJoinChannelSuccess: (_connection: RtcConnection) => {
          setLocalJoinedAgora(true);
          setJoining(false);
          if (isVideoCall) {
            try {
              engine.setupLocalVideo?.({
                uid: 0,
                renderMode: RenderModeType.RenderModeHidden,
                sourceType: VideoSourceType.VideoSourceCameraPrimary,
              });
              engine.startPreview?.();
            } catch {}
          }
        },
        onUserJoined: (_connection: RtcConnection, remoteUid: number) => {
          const parsedRemoteUid = Number(remoteUid || 0);
          if (!parsedRemoteUid) return;
          remoteUidsRef.current.add(parsedRemoteUid);
          if (isVideoCall) {
            setRemoteVideoUid(parsedRemoteUid);
            engine.muteRemoteVideoStream?.(parsedRemoteUid, false);
            engine.setupRemoteVideo?.({
              uid: parsedRemoteUid,
              renderMode: RenderModeType.RenderModeHidden,
              sourceType: VideoSourceType.VideoSourceRemote,
            });
          }
          setRemoteJoined(true);
          setParticipantsCount(Math.max(2, remoteUidsRef.current.size + 1));
          void stopTone(incomingToneRef.current);
          void stopTone(ringbackToneRef.current);
        },
        onUserOffline: (
          _connection: RtcConnection,
          remoteUid: number,
          _reason: UserOfflineReasonType
        ) => {
          const parsedRemoteUid = Number(remoteUid || 0);
          if (!parsedRemoteUid) return;
          remoteUidsRef.current.delete(parsedRemoteUid);
          setRemoteVideoUid((prev) => (prev === parsedRemoteUid ? null : prev));
          if (remoteUidsRef.current.size === 0) setRemoteJoined(false);
          setParticipantsCount(Math.max(1, remoteUidsRef.current.size + 1));
        },
      };

      engine.initialize({ appId: session.appId });
      engine.registerEventHandler(events);
      engine.enableAudio();

      if (isVideoCall) {
        engine.enableVideo();
        engine.enableLocalVideo?.(true);
        engine.setupLocalVideo?.({
          uid: 0,
          renderMode: RenderModeType.RenderModeHidden,
          sourceType: VideoSourceType.VideoSourceCameraPrimary,
        });
        engine.startPreview?.();
      }

      engine.setEnableSpeakerphone?.(speakerOn);

      const channelOptions = {
        autoSubscribeAudio: true,
        autoSubscribeVideo: isVideoCall,
        publishMicrophoneTrack: true,
        publishCameraTrack: isVideoCall && !cameraOff,
        channelProfile: 0,
        clientRoleType: 1,
      };

      if (session.userAccount && typeof engine.joinChannelWithUserAccount === "function") {
        engine.joinChannelWithUserAccount(
          session.rtcToken,
          session.channelName,
          session.userAccount,
          channelOptions
        );
      } else {
        engine.joinChannel(session.rtcToken, session.channelName, 0, channelOptions);
      }

      agoraEngineRef.current = engine;
      joinedAgoraChannelRef.current = true;
    } catch (error: any) {
      toast.error(error?.message || "Failed to join media session");
    }
  };

  const leaveOnce = (options?: { skipStatusUpdate?: boolean }) => {
    if (!callId || hasLeftRef.current) return;
    hasLeftRef.current = true;
    if (!options?.skipStatusUpdate) socketService.changeCallStatus(callId, "left", "User left");
    if (hasJoinedCallRoomRef.current) {
      socketService.leaveCall(callId);
      hasJoinedCallRoomRef.current = false;
    }
    void stopTone(incomingToneRef.current);
    void stopTone(ringbackToneRef.current);
    void cleanupAgora();
  };

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      return;
    }
    const interval = setInterval(() => {
      setElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [startedAt]);

  useEffect(() => {
    if (remoteJoined && !startedAt) setStartedAt(Date.now());
  }, [remoteJoined, startedAt]);

  useEffect(() => {
    if (mode === "incoming") {
      if (!hasAcceptedIncomingRef.current) {
        setJoining(true);
        setIsIncomingPending(true);
      }
      return;
    }

    setJoining(false);
    setIsIncomingPending(false);
    hasAcceptedIncomingRef.current = true;
  }, [mode]);

  useEffect(() => {
    setAudioModeAsync({
      playsInSilentMode: true,
      shouldPlayInBackground: false,
      allowsRecording: true,
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const playState = async () => {
      const isConnected = remoteJoined || Boolean(startedAt);
      const shouldPlayIncoming = isIncomingPending;
      const shouldPlayRingback = mode === "outgoing" && !isIncomingPending && !isConnected;

      if (shouldPlayIncoming) {
        const player = ensureIncomingTone();
        if (!player.playing) player.play();
      } else {
        await stopTone(incomingToneRef.current);
      }

      if (shouldPlayRingback) {
        const player = ensureRingbackTone();
        if (!player.playing) player.play();
      } else {
        await stopTone(ringbackToneRef.current);
      }
    };

    void playState();
  }, [isIncomingPending, mode, remoteJoined, startedAt]);

  useEffect(() => {
    if (isIncomingPending) return;
    if (!(remoteJoined || startedAt)) return;
    void stopTone(incomingToneRef.current);
    void stopTone(ringbackToneRef.current);
  }, [isIncomingPending, remoteJoined, startedAt]);

  useEffect(() => {
    if (!callId || !user?.id) return;

    let mounted = true;
    let onParticipants: ((payload: any) => void) | null = null;
    let onJoined: ((payload: any) => void) | null = null;
    let onEnded: ((payload: any) => void) | null = null;
    let onStatusChanged: ((payload: any) => void) | null = null;
    let onParticipantLeft: ((payload: any) => void) | null = null;
    let onParticipantDisconnected: ((payload: any) => void) | null = null;

    const bindCallSocket = async () => {
      try {
        await socketService.connectCalls();
        const details = await callService.getCallById(callId);
        const detectedType =
          String(details?.data?.type || "").toLowerCase() === "video" ? "video" : "audio";
        setCallType(detectedType);
        if (detectedType === "video") setCameraOff(false);

        const participants = Array.isArray(details?.data?.participants)
          ? details.data.participants
          : [];
        const me = participants.find((item: any) => item?.userId === user.id);
        const myStatus = String(me?.status || "").toLowerCase();
        const shouldJoinCallRoom = !["left", "declined", "missed"].includes(myStatus);

        if (shouldJoinCallRoom) {
          socketService.joinCall(callId);
          hasJoinedCallRoomRef.current = true;
        }

        if (mode === "outgoing" && shouldJoinCallRoom) {
          await ensureAgoraJoined();
        }

        onParticipants = (payload: any) => {
          if (!mounted || payload?.callId !== callId) return;
          const list = Array.isArray(payload?.participants) ? payload.participants : [];
          const active = list.filter((item: any) =>
            ACTIVE_PARTICIPANT_STATUSES.has(String(item?.status || "").toLowerCase())
          );
          const hasOtherJoined = list.some(
            (item: any) =>
              item?.userId &&
              item.userId !== user.id &&
              String(item?.status || "").toLowerCase() === "joined"
          );
          setParticipantsCount(Math.max(1, active.length || list.length || 1));
          if (mode === "incoming" && !hasAcceptedIncomingRef.current) return;
          setRemoteJoined(hasOtherJoined);
          if (hasOtherJoined) setJoining(false);
        };

        onJoined = (payload: any) => {
          const participantId = payload?.userId;
          if (!mounted || !participantId || participantId === user.id) return;
          if (mode === "incoming" && !hasAcceptedIncomingRef.current) return;
          setRemoteJoined(true);
          setJoining(false);
          setParticipantsCount((prev) => Math.max(2, prev + 1));
        };

        onEnded = (payload: any) => {
          if (!mounted || payload?.callId !== callId) return;
          closeCallScreen();
        };

        onStatusChanged = (payload: any) => {
          const participantId = payload?.userId;
          const status = String(payload?.status || "").toLowerCase();
          const eventCallId = payload?.callId;
          if (!mounted || !participantId) return;
          if (eventCallId && eventCallId !== callId) return;

          if (participantId === user.id) {
            if (mode === "incoming" && status === "joined") {
              setIsIncomingPending(false);
              setJoining(true);
            }
            return;
          }

          if (status === "joined") {
            setRemoteJoined(true);
            setJoining(false);
          }

          if (status === "declined" || status === "missed" || status === "left") {
            closeCallScreen();
          }
        };

        const closeOnRemoteLeave = (payload: any) => {
          const participantId = payload?.userId;
          const eventCallId = payload?.callId;
          if (!mounted || !participantId || participantId === user.id) return;
          if (eventCallId && eventCallId !== callId) return;
          closeCallScreen();
        };

        onParticipantLeft = closeOnRemoteLeave;
        onParticipantDisconnected = closeOnRemoteLeave;

        socketService.onCallParticipants(onParticipants);
        socketService.onParticipantJoined(onJoined);
        socketService.onCallEnded(onEnded);
        socketService.onParticipantStatusChanged(onStatusChanged);
        socketService.onParticipantLeft(onParticipantLeft);
        socketService.onParticipantDisconnected(onParticipantDisconnected);
      } catch (error: any) {
        if (mounted) toast.error(error?.message || "Failed to connect call socket");
      }
    };

    void bindCallSocket();

    return () => {
      mounted = false;
      leaveOnce();
      if (onParticipants) socketService.offCallParticipants(onParticipants);
      if (onJoined) socketService.offParticipantJoined(onJoined);
      if (onEnded) socketService.offCallEnded(onEnded);
      if (onStatusChanged) socketService.offParticipantStatusChanged(onStatusChanged);
      if (onParticipantLeft) socketService.offParticipantLeft(onParticipantLeft);
      if (onParticipantDisconnected) socketService.offParticipantDisconnected(onParticipantDisconnected);
    };
  }, [callId, mode, user?.id]);

  useEffect(() => {
    hasClosedRef.current = false;
    return () => {
      void stopTone(incomingToneRef.current);
      void stopTone(ringbackToneRef.current);
      void cleanupAgora();
      incomingToneRef.current?.remove?.();
      ringbackToneRef.current?.remove?.();
      incomingToneRef.current = null;
      ringbackToneRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!callId) return;
    let mounted = true;
    const interval = setInterval(async () => {
      if (!mounted || hasClosedRef.current) return;
      try {
        const details = await callService.getCallById(callId);
        const status = String(details?.data?.status || "").toLowerCase();
        const participants = Array.isArray(details?.data?.participants) ? details.data.participants : [];
        const hasRemoteJoined = participants.some(
          (item: any) =>
            item?.userId &&
            item.userId !== user?.id &&
            String(item?.status || "").toLowerCase() === "joined"
        );
        const hasRemoteActive = participants.some(
          (item: any) =>
            item?.userId &&
            item.userId !== user?.id &&
            ACTIVE_PARTICIPANT_STATUSES.has(String(item?.status || "").toLowerCase())
        );

        if (hasRemoteJoined && (mode === "outgoing" || hasAcceptedIncomingRef.current)) {
          setRemoteJoined(true);
          setJoining(false);
          setIsIncomingPending(false);
          setParticipantsCount((prev) => Math.max(2, prev));
        }

        if (TERMINAL_CALL_STATUSES.has(status)) {
          closeCallScreen();
          return;
        }

        if ((mode === "outgoing" || hasAcceptedIncomingRef.current) && !hasRemoteActive && remoteJoined) {
          closeCallScreen();
        }
      } catch {}
    }, 2500);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [callId, mode, remoteJoined, user?.id]);

  const durationText = useMemo(() => {
    const mins = String(Math.floor(elapsed / 60)).padStart(2, "0");
    const secs = String(elapsed % 60).padStart(2, "0");
    return `${mins}:${secs}`;
  }, [elapsed]);

  const callStatusText = useMemo(() => {
    if (isIncomingPending) return "Incoming call...";
    if (joining) return "Connecting...";
    if (!remoteJoined) return "Ringing...";
    return durationText;
  }, [durationText, isIncomingPending, joining, remoteJoined]);

  const handleAccept = async () => {
    if (!callId || accepting) return;
    try {
      setAccepting(true);
      await callService.joinCall(callId, { isMicMuted: false, isCameraOff: !isVideoCall });
      try {
        await callService.updateCallStatus(callId, "joined");
      } catch {}
      hasAcceptedIncomingRef.current = true;
      if (!hasJoinedCallRoomRef.current) {
        socketService.joinCall(callId);
        hasJoinedCallRoomRef.current = true;
      }
      socketService.changeCallStatus(callId, "joined", "User accepted call");
      setIsIncomingPending(false);
      setJoining(true);
      await stopTone(incomingToneRef.current);
      await stopTone(ringbackToneRef.current);
      await ensureAgoraJoined();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || error?.message || "Failed to accept call");
    } finally {
      setAccepting(false);
    }
  };

  const handleReject = async () => {
    if (!callId || rejecting) return;
    try {
      setRejecting(true);
      socketService.changeCallStatus(callId, "declined", "User declined");
      await callService.updateCallStatus(callId, "declined");
      leaveOnce({ skipStatusUpdate: true });
    } finally {
      setRejecting(false);
      router.back();
    }
  };

  const handleEnd = async () => {
    if (!callId || ending) {
      router.back();
      return;
    }
    try {
      setEnding(true);
      await callService.endCall(callId);
    } catch (error: any) {
      const message = error?.response?.data?.message || error?.message || "Failed to end call";
      if (!String(message).toLowerCase().includes("after leaving or declining")) {
        toast.error(message);
      }
    } finally {
      leaveOnce({ skipStatusUpdate: true });
      setEnding(false);
      router.back();
    }
  };

  const handleToggleCamera = useCallback(() => {
    if (!isVideoCall) return;
    const next = !cameraOff;
    setCameraOff(next);
    try {
      agoraEngineRef.current?.muteLocalVideoStream?.(next);
      if (!next) {
        agoraEngineRef.current?.startPreview?.();
      } else {
        agoraEngineRef.current?.stopPreview?.();
      }
    } catch {}
    if (callId) {
      socketService.changeMediaState(callId, muted, next, false);
      void callService.updateMediaState(callId, {
        isMicMuted: muted,
        isCameraOff: next,
        isSharingScreen: false,
      });
    }
  }, [callId, cameraOff, isVideoCall, muted]);

  const handleSwitchCamera = useCallback(() => {
    if (!isVideoCall) return;
    try {
      agoraEngineRef.current?.switchCamera?.();
    } catch {
      toast.error("Failed to switch camera");
    }
  }, [isVideoCall]);

  const handleToggleMute = useCallback(() => {
    const next = !muted;
    setMuted(next);
    if (callId) {
      socketService.changeMediaState(callId, next);
      void callService.updateMediaState(callId, {
        isMicMuted: next,
        isCameraOff: !isVideoCall || cameraOff,
        isSharingScreen: false,
      });
    }
    agoraEngineRef.current?.muteLocalAudioStream?.(next);
  }, [callId, cameraOff, isVideoCall, muted]);

  const handleToggleSpeaker = useCallback(() => {
    const next = !speakerOn;
    setSpeakerOn(next);
    agoraEngineRef.current?.setEnableSpeakerphone?.(next);
  }, [speakerOn]);

  return {
    isVideoCall,
    joining,
    callStatusText,
    participantsCount,
    remoteVideoUid,
    cameraOff,
    localJoinedAgora,
    RemoteVideoView,
    LocalVideoView,
    isIncomingPending,
    accepting,
    rejecting,
    ending,
    muted,
    speakerOn,
    handleAccept,
    handleReject,
    handleEnd,
    handleToggleMute,
    handleToggleSpeaker,
    handleToggleCamera,
    handleSwitchCamera,
  };
};
