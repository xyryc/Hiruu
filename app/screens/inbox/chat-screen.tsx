import ChatScreenHeader from "@/components/header/ChatScreenHeader";
import JobCard from "@/components/ui/cards/JobCard";
import NoMessages from "@/components/ui/cards/NoMessages";
import RenderMessage from "@/components/ui/cards/RenderMessage";
import ChatInput from "@/components/ui/inputs/ChatInput";
import TypingIndicator from "@/components/ui/inputs/TypingIndicator";
import ChatActionConfirmModal from "@/components/ui/modals/ChatActionConfirmModal";
import { useChat } from "@/hooks/useChat";
import { callService } from "@/services/callService";
import type { ChatUploadMedia } from "@/services/chatService";
import { chatService } from "@/services/chatService";
import { useAuthStore } from "@/stores/authStore";
import { translateApiMessage } from "@/utils/apiMessages";
import * as ImagePicker from "expo-image-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StatusBar,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

type SelectedMedia = ChatUploadMedia & {
  previewType: "image" | "video";
};

type ChatMediaPreview = {
  id: string;
  uri: string;
  previewType: "image" | "video";
  name?: string;
  thumbnailUrl?: string;
};

const resolveMediaUrl = (value?: string | null) => {
  if (!value || typeof value !== "string") return undefined;
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  const base = (process.env.EXPO_PUBLIC_API_URL || "").replace(/\/$/, "");
  if (!base) return value;
  return `${base}${value.startsWith("/") ? value : `/${value}`}`;
};

const ChatScreen = () => {
  const { t } = useTranslation();
  const [message, setMessage] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<SelectedMedia[]>([]);
  const [actualRoomId, setActualRoomId] = useState<string | null>(null);
  const [loadingRoom, setLoadingRoom] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [startingAudioCall, setStartingAudioCall] = useState(false);
  const [startingVideoCall, setStartingVideoCall] = useState(false);
  const [androidKeyboardOffset, setAndroidKeyboardOffset] = useState(0);
  const [chatTitle, setChatTitle] = useState(t("common.chat.defaultTitle"));
  const [chatAvatar, setChatAvatar] = useState<string | null>(null);
  const [chatIsOnline, setChatIsOnline] = useState<boolean | undefined>(undefined);
  const [roomDetails, setRoomDetails] = useState<any>(null);
  const [isBlockingUser, setIsBlockingUser] = useState(false);
  const [isDeletingConversation, setIsDeletingConversation] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"toggle-block" | "delete" | null>(null);
  const messagesListRef = useRef<FlatList<any> | null>(null);
  const previousMessageCountRef = useRef(0);
  const didInitialScrollRef = useRef(false);
  const initialAutoScrollTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { user } = useAuthStore();
  const router = useRouter();
  const params = useLocalSearchParams<{ roomId?: string; userId?: string }>();

  // Backend expects roomId from route params.
  const roomId =
    typeof params?.roomId === "string" ? params.roomId : undefined;


  // Initialize room strictly from params.roomId.
  useEffect(() => {
    setLoadingRoom(true);
    if (!user?.id) {
      setLoadingRoom(false);
      return;
    }
    if (!roomId) {
      toast.error(t("common.chat.missingRoomId"));
      setActualRoomId(null);
      setLoadingRoom(false);
      return;
    }
    setActualRoomId(roomId);
    setLoadingRoom(false);
  }, [roomId, user?.id]);

  useEffect(() => {
    let isMounted = true;

    const loadRoom = async () => {
      if (!actualRoomId || !user?.id) return;
      try {
        const result = await chatService.getChatRoom(actualRoomId);
        const room = result?.data;

        if (!room || !isMounted) return;
        setRoomDetails(room);

        if (room.type !== "direct") {
          setChatTitle(room.name || t("common.chat.groupChat"));
          setChatAvatar(room.avatar || room?.business?.logo || null);
          setChatIsOnline(undefined);
          return;
        }

        const otherParticipant = (room.participants || []).find(
          (participant: any) => participant?.userId && participant.userId !== user.id
        );

        const nextTitle =
          otherParticipant?.nickname ||
          otherParticipant?.user?.name ||
          room.name ||
          t("common.chat.directChat");

        setChatTitle(nextTitle);
        setChatAvatar(otherParticipant?.user?.avatar || room.avatar || null);
        setChatIsOnline(
          typeof otherParticipant?.user?.isOnline === "boolean"
            ? otherParticipant.user.isOnline
            : undefined
        );
      } catch {
        if (isMounted) {
          setChatTitle(t("common.chat.defaultTitle"));
          setChatAvatar(null);
          setChatIsOnline(undefined);
          setRoomDetails(null);
        }
      }
    };

    loadRoom();

    return () => {
      isMounted = false;
    };
  }, [actualRoomId, t, user?.id]);

  const linkedRecruitment = useMemo(() => {
    const recruitment = roomDetails?.referenceRecruitment;
    if (!recruitment?.id) return undefined;

    const roleName =
      recruitment?.role?.role?.name ||
      recruitment?.role?.name ||
      recruitment?.name ||
      t("common.chat.jobFallback");
    const business = recruitment?.business || roomDetails?.business || null;
    const businessId = recruitment?.businessId || business?.id;

    return {
      id: recruitment.id,
      businessId,
      roleId: recruitment?.roleId,
      name: recruitment?.name || roleName,
      description: recruitment?.description,
      isFeatured: Boolean(recruitment?.isFeatured),
      isActive: recruitment?.isActive ?? true,
      shareCount:
        typeof recruitment?.shareCount === "number" ? recruitment.shareCount : 0,
      shiftType: recruitment?.shiftType || "",
      jobType: recruitment?.jobType || "",
      salaryMin:
        typeof recruitment?.salaryMin === "number" ? recruitment.salaryMin : 0,
      salaryMax:
        typeof recruitment?.salaryMax === "number" ? recruitment.salaryMax : 0,
      salaryType: recruitment?.salaryType || "hourly",
      distanceKm:
        typeof recruitment?.distanceKm === "number" ? recruitment.distanceKm : undefined,
      shiftStartTime: recruitment?.shiftStartTime,
      shiftEndTime: recruitment?.shiftEndTime,
      role: recruitment?.role,
      business: businessId
        ? {
          id: businessId,
          name: business?.name || "-",
          logo: resolveMediaUrl(business?.logo),
          address: business?.address,
          isPremium: Boolean(business?.isPremium),
        }
        : null,
      _count: recruitment?._count,
    };
  }, [roomDetails, t]);

  const shouldShowJobCard = useMemo(() => {
    const roomType = String(roomDetails?.type || "").toLowerCase();
    if (roomType === "business_group") return false;
    return Boolean(linkedRecruitment);
  }, [linkedRecruitment, roomDetails?.type]);

  const targetParticipantUserId = useMemo(() => {
    const participants = Array.isArray(roomDetails?.participants)
      ? roomDetails.participants
      : [];
    const otherParticipant = participants.find(
      (participant: any) => participant?.userId && participant.userId !== user?.id
    );
    return otherParticipant?.userId || otherParticipant?.user?.id || null;
  }, [roomDetails?.participants, user?.id]);

  const canBlockUser = useMemo(() => {
    return String(roomDetails?.type || "").toLowerCase() === "direct" && Boolean(targetParticipantUserId);
  }, [roomDetails?.type, targetParticipantUserId]);

  const blockStatus = useMemo(() => {
    return roomDetails?.blockStatus || null;
  }, [roomDetails?.blockStatus]);

  const isBlocked = useMemo(() => {
    return Boolean(blockStatus?.isBlocked);
  }, [blockStatus?.isBlocked]);

  const blockedByMe = useMemo(() => {
    return String(blockStatus?.status || "").toLowerCase() === "sent";
  }, [blockStatus?.status]);

  // IMPORTANT: Always call useChat hook unconditionally
  // Pass empty string if roomId not ready yet
  const {
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
    refreshMessages,
  } = useChat({
    roomId: actualRoomId || '', // Pass empty string if not ready
    onError: (error) => {
      // Show user-friendly error messages
      const errorMessage = error.message || t("common.chat.errorFallback");

      if (errorMessage.includes("cannot send messages")) {
        toast.error(t("common.chat.noPermissionSend"));
      } else if (errorMessage.includes("not found")) {
        toast.error(t("common.chat.roomNotFound"));
      } else if (errorMessage.includes("unauthorized")) {
        toast.error(t("common.chat.loginAgain"));
      } else {
        toast.error(errorMessage);
      }
    },
  });

  const formatTime = useCallback((dateString?: string | null) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }, []);

  const formatDateLabel = useCallback((dateString?: string | null) => {
    if (!dateString) return "";

    const date = new Date(dateString);
    if (Number.isNaN(date.getTime())) return "";

    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    const isSameDay = (a: Date, b: Date) =>
      a.getFullYear() === b.getFullYear() &&
      a.getMonth() === b.getMonth() &&
      a.getDate() === b.getDate();

    if (isSameDay(date, today)) return t("common.chat.today");
    if (isSameDay(date, yesterday)) return t("common.chat.yesterday");

    return date.toLocaleDateString([], { month: "short", day: "numeric", year: "numeric" });
  }, [t]);

  const detectPreviewType = useCallback((input: any): "image" | "video" | null => {
    if (!input) return null;

    const mediaType = String(
      input.previewType ||
      input.mediaType ||
      input.mimeType ||
      input.mimetype ||
      input.type ||
      ""
    ).toLowerCase();

    if (mediaType.includes("video")) return "video";
    if (mediaType.includes("image")) return "image";

    const url = String(input.uri || input.url || input.fileUrl || input.path || "").toLowerCase();
    if (!url) return null;

    if (/\.(mp4|mov|m4v|webm|avi|mkv)(\?|$)/.test(url)) return "video";
    if (/\.(jpg|jpeg|png|gif|webp|heic|heif)(\?|$)/.test(url)) return "image";

    return null;
  }, []);

  const mapMessageMedia = useCallback((msg: any): ChatMediaPreview[] => {
    const candidates = [
      ...(Array.isArray(msg?.media) ? msg.media : []),
      ...(Array.isArray(msg?.attachments) ? msg.attachments : []),
      ...(Array.isArray(msg?.files) ? msg.files : []),
    ];

    return candidates
      .map((item: any, index: number) => {
        const uri = item?.url || item?.uri || item?.fileUrl || item?.path || "";
        const previewType = detectPreviewType(item);

        if (!uri || !previewType) return null;

        return {
          id: item?.id || `${msg?.id}-media-${index}`,
          uri,
          previewType,
          name: item?.name || item?.fileName,
          thumbnailUrl: item?.thumbnailUrl || item?.thumbnail || item?.poster || undefined,
        };
      })
      .filter(Boolean) as ChatMediaPreview[];
  }, [detectPreviewType]);

  const getMessageDateValue = useCallback((msg: any) => {
    return (
      msg?.createdAt ||
      msg?.sentAt ||
      msg?.timestamp ||
      msg?.created_at ||
      msg?.updatedAt ||
      null
    );
  }, []);

  const mapCallMessage = useCallback((msg: any, currentUserId?: string) => {
    const typeCandidate = String(
      msg?.messageType ||
      msg?.type ||
      msg?.eventType ||
      msg?.message?.type ||
      ""
    ).toLowerCase();

    const hasCallObject = Boolean(msg?.call || msg?.callData || msg?.callMeta);
    const isCallType = typeCandidate.includes("call");
    const isCallLogType = typeCandidate === "call_log";

    if (!hasCallObject && !isCallType) return null;

    const callPayload = msg?.call || msg?.callData || msg?.callMeta || {};
    const rawCallType = String(
      callPayload?.type || msg?.callType || msg?.metadata?.callType || ""
    ).toLowerCase();
    const rawStatus = String(
      callPayload?.status || msg?.callStatus || msg?.metadata?.callStatus || "ended"
    ).toLowerCase();

    const callType: "audio" | "video" = rawCallType === "video" ? "video" : "audio";
    const direction: "incoming" | "outgoing" =
      msg?.senderId && currentUserId && msg.senderId === currentUserId ? "outgoing" : "incoming";

    const formatSecondsToDuration = (value: number) => {
      if (!Number.isFinite(value) || value <= 0) return undefined;
      const totalSeconds = Math.floor(value);
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
      }
      return `${minutes}:${String(seconds).padStart(2, "0")}`;
    };

    const parseDurationFromString = (value: unknown) => {
      if (typeof value !== "string") return undefined;
      const text = value.trim();
      if (!text) return undefined;

      const timeMatch = text.match(/(\d{1,2}):(\d{2})(?::(\d{2}))?/);
      if (timeMatch) {
        if (typeof timeMatch[3] === "string") {
          return `${Number(timeMatch[1])}:${timeMatch[2]}:${timeMatch[3]}`;
        }
        return `${Number(timeMatch[1])}:${timeMatch[2]}`;
      }

      const secondsMatch = text.match(/(\d+)\s*(s|sec|secs|second|seconds)\b/i);
      if (secondsMatch) {
        return formatSecondsToDuration(Number(secondsMatch[1]));
      }

      const numericOnly = text.match(/^\d+$/);
      if (numericOnly) {
        return formatSecondsToDuration(Number(text));
      }

      return undefined;
    };

    const attachments = Array.isArray(msg?.attachments) ? msg.attachments : [];
    const attachmentDurationCandidates = attachments.flatMap((item: any) => [
      item?.content,
      item?.durationLabel,
      item?.durationText,
      item?.duration,
      item?.durationSeconds,
      item?.metadata?.duration,
      item?.metadata?.durationSeconds,
    ]);

    const durationFromContent = parseDurationFromString(msg?.content);
    const durationFromAttachments = attachmentDurationCandidates
      .map((candidate: any) =>
        typeof candidate === "number"
          ? formatSecondsToDuration(candidate)
          : parseDurationFromString(candidate)
      )
      .find(Boolean);

    const durationFromPayload = formatSecondsToDuration(
      Number(
        callPayload?.durationSeconds ??
        callPayload?.duration ??
        msg?.metadata?.durationSeconds ??
        msg?.metadata?.duration
      )
    );

    const formattedDuration = isCallLogType
      ? (durationFromContent || durationFromAttachments || durationFromPayload)
      : (durationFromPayload || durationFromContent || durationFromAttachments);

    const directionLabel =
      direction === "incoming" ? t("common.chat.callIncoming") : t("common.chat.callOutgoing");
    const typeLabel =
      callType === "video" ? t("common.chat.videoCall") : t("common.chat.audioCall");

    let label = `${directionLabel} ${typeLabel}`;
    if (rawStatus === "missed") {
      label = t("common.chat.callMissedLabel", { type: typeLabel });
    } else if (rawStatus === "declined") {
      label = t("common.chat.callDeclinedLabel", {
        direction: directionLabel,
        type: typeLabel,
      });
    }

    const subtitle = rawStatus === "missed"
      ? t("common.chat.callNoAnswer")
      : rawStatus === "declined"
        ? t("common.chat.callDeclined")
        : formattedDuration
          ? t("common.chat.callEndedWithDuration", { duration: formattedDuration })
          : t("common.chat.callEnded");

    return {
      type: callType,
      status: rawStatus,
      label,
      subtitle,
      duration: formattedDuration,
    };
  }, [t]);

  const mappedMessages = useMemo(() => {
    const currentUserId = user?.id;
    const sortedMessages = [...messages].sort((a, b) => {
      const aTime = new Date(getMessageDateValue(a) || 0).getTime();
      const bTime = new Date(getMessageDateValue(b) || 0).getTime();
      return aTime - bTime;
    });

    return sortedMessages.map((msg, index) => {
      const prev = sortedMessages[index - 1];
      const messageDateValue = getMessageDateValue(msg);
      const prevDateValue = prev ? getMessageDateValue(prev) : null;
      const currentDateLabel = formatDateLabel(messageDateValue);
      const prevDateLabel = prev ? formatDateLabel(prevDateValue) : "";
      const shouldShowDateSeparator =
        Boolean(currentDateLabel) && (index === 0 || currentDateLabel !== prevDateLabel);

      return {
        id: msg.id,
        text: msg.content || "",
        time: formatTime(messageDateValue),
        isSent: msg.senderId === currentUserId,
        status: msg.status,
        avatar: msg.sender?.avatar || require("@/assets/images/placeholder.png"),
        media: mapMessageMedia(msg),
        call: mapCallMessage(msg, currentUserId),
        uploadState: msg.uploadState,
        // Oldest-first data: attach separator to first message of each day bucket.
        showDateSeparator: shouldShowDateSeparator,
        dateLabel: currentDateLabel,
      };
    });
  }, [messages, user?.id, formatDateLabel, formatTime, mapMessageMedia, mapCallMessage, getMessageDateValue]);

  const handlePickMedia = useCallback(async () => {
    if (sending) return;

    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permission.status !== "granted") {
      toast.error(t("common.chat.mediaPermissionRequired"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsMultipleSelection: true,
      quality: 1,
      selectionLimit: 10,
    });

    if (result.canceled) return;

    const pickedMedia: SelectedMedia[] = result.assets
      .map((asset, index) => {
        const previewType = asset.type === "video" ? "video" : asset.type === "image" ? "image" : null;

        if (!previewType) return null;

        const extension = previewType === "video" ? "mp4" : "jpg";
        const fallbackName = `upload-${Date.now()}-${index}.${extension}`;

        return {
          uri: asset.uri,
          type: asset.mimeType || (previewType === "video" ? "video/mp4" : "image/jpeg"),
          name: asset.fileName || fallbackName,
          previewType,
        };
      })
      .filter((item): item is SelectedMedia => Boolean(item));

    if (!pickedMedia.length) {
      toast.error(t("common.chat.mediaOnlyImagesVideos"));
      return;
    }

    setSelectedMedia((prev) => {
      const existingUris = new Set(prev.map((item) => item.uri));
      const uniqueNew = pickedMedia.filter((item) => !existingUris.has(item.uri));
      return [...prev, ...uniqueNew];
    });
  }, [sending]);

  const handleRemoveSelectedMedia = useCallback((uri: string) => {
    setSelectedMedia((prev) => prev.filter((item) => item.uri !== uri));
  }, []);

  const handleSend = useCallback(async () => {
    if (sending) return;

    const content = message.trim();
    const media = selectedMedia.map(({ previewType, ...file }) => file);

    if (!content && media.length === 0) return;

    setMessage("");
    setSelectedMedia([]);

    const success = await sendMessage({
      content: content || undefined,
      media,
    });

    if (!success) {
      setMessage(content);
      setSelectedMedia((prev) => (prev.length ? prev : selectedMedia));
    }
  }, [message, selectedMedia, sending, sendMessage]);

  const handleRetryMediaUpload = useCallback((messageId: string | number) => {
    void retryFailedMessage(String(messageId));
  }, [retryFailedMessage]);

  const handleTyping = useCallback(() => {
    startTyping();
  }, [startTyping]);

  const handleStopTyping = useCallback(() => {
    stopTyping();
  }, [stopTyping]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshMessages();
    setRefreshing(false);
  }, [refreshMessages]);

  const handleStartCall = useCallback(async (callType: "audio" | "video") => {
    if (!actualRoomId) return;
    if ((callType === "audio" && startingAudioCall) || (callType === "video" && startingVideoCall)) return;

    const getMyParticipantStatus = (call: any) => {
      const participants = Array.isArray(call?.participants) ? call.participants : [];
      const me = participants.find((p: any) => p?.userId === user?.id);
      return String(me?.status || "").toLowerCase();
    };

    const isTerminalStatus = (status: string) =>
      status === "left" || status === "declined" || status === "missed";

    const hasOtherActiveParticipant = (call: any) => {
      const participants = Array.isArray(call?.participants) ? call.participants : [];
      return participants.some((p: any) => {
        if (!p?.userId || p.userId === user?.id) return false;
        const status = String(p?.status || "").toLowerCase();
        return status === "invited" || status === "ringing" || status === "joined";
      });
    };

    const hasAnyActiveParticipant = (call: any) => {
      const participants = Array.isArray(call?.participants) ? call.participants : [];
      return participants.some((p: any) => {
        const status = String(p?.status || "").toLowerCase();
        return status === "invited" || status === "ringing" || status === "joined";
      });
    };

    const getModeForCall = (call: any) =>
      call?.initiatedBy === user?.id ? "outgoing" : "incoming";
    const getTypeForCall = (call: any) =>
      String(call?.type || "").toLowerCase() === "video" ? "video" : "audio";
    const getCallPath = (type: "audio" | "video") =>
      type === "video" ? "/screens/inbox/video-call" : "/screens/inbox/audio-call";
    const setStarting = (value: boolean) => {
      if (callType === "video") {
        setStartingVideoCall(value);
      } else {
        setStartingAudioCall(value);
      }
    };

    try {

      // Pre-check active call to avoid stale-call initiate errors.
      try {
        const activeResponse = await callService.getActiveCall(actualRoomId);
        const activeCall = activeResponse?.data;
        if (activeCall?.id) {
          const myStatus = getMyParticipantStatus(activeCall);
          const isInitiator = activeCall?.initiatedBy === user?.id;
          const hasOtherActive = hasOtherActiveParticipant(activeCall);
          const hasAnyActive = hasAnyActiveParticipant(activeCall);

          // If I initiated and no one else is active, close stale call then create a fresh call.
          if (
            (isInitiator && (isTerminalStatus(myStatus) || !hasOtherActive)) ||
            (!isInitiator && isTerminalStatus(myStatus) && !hasAnyActive)
          ) {
            try {
              await callService.endCall(activeCall.id);
            } catch (endErr) {
              console.error("[ChatScreen] active precheck end error:", endErr);
            }
          } else {
            router.push({
              pathname: getCallPath(getTypeForCall(activeCall)),
              params: {
                callId: activeCall.id,
                roomId: actualRoomId,
                mode: getModeForCall(activeCall),
                callType: getTypeForCall(activeCall),
              },
            });
            return;
          }
        }
      } catch {
        // No active call in this room, continue with initiate.
      }

      setStarting(true);
      const response = await callService.initiateCall(actualRoomId, callType);
      const callData = response?.data;
      const callId =
        callData?.id || callData?.callId || callData?.call?.id || null;

      if (!callId) {
        toast.error(t("common.chat.callIdMissing"));
        return;
      }

      router.push({
        pathname: getCallPath(callType),
        params: { callId, roomId: actualRoomId, mode: "outgoing", callType },
      });
    } catch (error: any) {
      console.error("[ChatScreen] initiate-call error:", error);
      const apiMessage =
        error?.response?.data?.message ||
        error?.message ||
        t("common.chat.failedToStartCall", {
          type:
            callType === "video"
              ? t("common.chat.videoCall")
              : t("common.chat.audioCall"),
        });
      const localizedApiMessage =
        typeof apiMessage === "string" ? translateApiMessage(apiMessage) : apiMessage;

      if (
        typeof apiMessage === "string" &&
        (apiMessage.toLowerCase().includes("already an ongoing call") ||
          apiMessage === "calls_there_is_already_an_ongoing_call_in_this_room")
      ) {
        try {
          const activeResponse = await callService.getActiveCall(actualRoomId);
          const activeCall = activeResponse?.data;
          const activeCallId = activeCall?.id;
          if (activeCallId) {
            const isInitiator = activeCall?.initiatedBy === user?.id;
            const myStatus = getMyParticipantStatus(activeCall);
            const hasOtherActive = hasOtherActiveParticipant(activeCall);
            const hasAnyActive = hasAnyActiveParticipant(activeCall);
            if (
              (isInitiator && (isTerminalStatus(myStatus) || !hasOtherActive)) ||
              (!isInitiator && isTerminalStatus(myStatus) && !hasAnyActive)
            ) {
              try {
                await callService.endCall(activeCallId);
                const retry = await callService.initiateCall(actualRoomId, callType);
                const retryCallId = retry?.data?.id;
                if (retryCallId) {
                  router.push({
                    pathname: getCallPath(callType),
                    params: {
                      callId: retryCallId,
                      roomId: actualRoomId,
                      mode: "outgoing",
                      callType,
                    },
                  });
                  return;
                }
              } catch (retryError) {
                console.error("[ChatScreen] retry-after-end error:", retryError);
              }
            }
            router.push({
              pathname: getCallPath(getTypeForCall(activeCall)),
              params: {
                callId: activeCallId,
                roomId: actualRoomId,
                mode: isInitiator ? "outgoing" : "incoming",
                callType: getTypeForCall(activeCall),
              },
            });
            return;
          }
        } catch (activeError) {
          console.error("[ChatScreen] active-call fetch error:", activeError);
        }
      }

      toast.error(localizedApiMessage);
    } finally {
      setStarting(false);
    }
  }, [actualRoomId, router, startingAudioCall, startingVideoCall, user?.id]);

  const handleStartAudioCall = useCallback(() => {
    void handleStartCall("audio");
  }, [handleStartCall]);

  const handleStartVideoCall = useCallback(() => {
    void handleStartCall("video");
  }, [handleStartCall]);

  const handleSeeProfile = useCallback(() => {
    if (!actualRoomId || !user?.id) {
      toast.error(t("common.chat.userInfoUnavailable"));
      return;
    }

    const participants = Array.isArray(roomDetails?.participants)
      ? roomDetails.participants
      : [];
    const otherParticipant = participants.find(
      (participant: any) => participant?.userId && participant.userId !== user.id
    );
    const targetUserId = otherParticipant?.userId || otherParticipant?.user?.id;

    if (!targetUserId) {
      toast.error(t("common.chat.userInfoUnavailable"));
      return;
    }

    router.push({
      pathname: "/screens/jobs/business/user-profile-preview",
      params: { userId: String(targetUserId) },
    });
  }, [actualRoomId, roomDetails?.participants, router, user?.id]);

  const handleToggleBlockUser = useCallback(async () => {
    if (!targetParticipantUserId) {
      toast.error(t("common.chat.userInfoUnavailable"));
      return;
    }

    try {
      setIsBlockingUser(true);
      const result = blockedByMe
        ? await chatService.unblockUser(String(targetParticipantUserId))
        : await chatService.blockUser(String(targetParticipantUserId));
      toast.success(
        translateApiMessage(
          result?.message ||
          (blockedByMe
            ? "chat_user_unblocked_successfully"
            : "chat_user_blocked_successfully")
        )
      );

      setRoomDetails((prev: any) => {
        if (!prev) return prev;
        return {
          ...prev,
          blockStatus: blockedByMe
            ? { status: "none", isBlocked: false, targetUserId: targetParticipantUserId }
            : { status: "sent", isBlocked: true, targetUserId: targetParticipantUserId },
        };
      });
    } catch (error: any) {
      toast.error(
        translateApiMessage(
          error?.response?.data?.message ||
          error?.message ||
          (blockedByMe ? t("common.chat.failedToUnblockUser") : t("common.chat.failedToBlockUser"))
        )
      );
    } finally {
      setIsBlockingUser(false);
    }
  }, [blockedByMe, t, targetParticipantUserId]);

  const handleDeleteConversation = useCallback(async () => {
    if (!actualRoomId) {
      toast.error(t("common.chat.roomInfoUnavailable"));
      return;
    }

    try {
      setIsDeletingConversation(true);
      const result = await chatService.hardDeleteChatRoom(actualRoomId);
      toast.success(
        translateApiMessage(
          result?.message || "chat_chat_room_hard_deleted_successfully"
        )
      );
      router.back();
    } catch (error: any) {
      toast.error(
        translateApiMessage(
          error?.response?.data?.message ||
            error?.message ||
            t("common.chat.failedToDeleteConversation")
        )
      );
    } finally {
      setIsDeletingConversation(false);
    }
  }, [actualRoomId, router, t]);

  const handleConfirmAction = useCallback(async () => {
    if (confirmAction === "toggle-block") {
      await handleToggleBlockUser();
      setConfirmAction(null);
      return;
    }

    if (confirmAction === "delete") {
      await handleDeleteConversation();
      setConfirmAction(null);
    }
  }, [confirmAction, handleDeleteConversation, handleToggleBlockUser]);

  const scrollToBottom = useCallback((animated: boolean) => {
    const list = messagesListRef.current;
    if (!list) return;

    const run = () => {
      try {
        list.scrollToEnd({ animated });
      } catch {
        // Ignore transient layout timing errors.
      }
    };

    requestAnimationFrame(run);
    setTimeout(run, 80);
    setTimeout(run, 250);
  }, []);

  useEffect(() => {
    if (!mappedMessages.length) {
      previousMessageCountRef.current = 0;
      didInitialScrollRef.current = false;
      if (initialAutoScrollTimerRef.current) {
        clearInterval(initialAutoScrollTimerRef.current);
        initialAutoScrollTimerRef.current = null;
      }
      return;
    }

    const hasNewMessage = mappedMessages.length > previousMessageCountRef.current;
    if (hasNewMessage) {
      scrollToBottom(previousMessageCountRef.current > 0);
    }

    previousMessageCountRef.current = mappedMessages.length;
  }, [mappedMessages.length, scrollToBottom]);

  useEffect(() => {
    if (loading || !mappedMessages.length || didInitialScrollRef.current) return;

    let attempts = 0;
    if (initialAutoScrollTimerRef.current) {
      clearInterval(initialAutoScrollTimerRef.current);
      initialAutoScrollTimerRef.current = null;
    }

    initialAutoScrollTimerRef.current = setInterval(() => {
      scrollToBottom(false);
      attempts += 1;
      if (attempts >= 12) {
        if (initialAutoScrollTimerRef.current) {
          clearInterval(initialAutoScrollTimerRef.current);
          initialAutoScrollTimerRef.current = null;
        }
        didInitialScrollRef.current = true;
      }
    }, 120);

    return () => {
      if (initialAutoScrollTimerRef.current) {
        clearInterval(initialAutoScrollTimerRef.current);
        initialAutoScrollTimerRef.current = null;
      }
    };
  }, [actualRoomId, loading, mappedMessages.length, scrollToBottom]);

  useEffect(() => {
    didInitialScrollRef.current = false;
    previousMessageCountRef.current = 0;
    if (initialAutoScrollTimerRef.current) {
      clearInterval(initialAutoScrollTimerRef.current);
      initialAutoScrollTimerRef.current = null;
    }
  }, [actualRoomId]);

  useEffect(() => {
    if (Platform.OS !== "android") return;

    const showSub = Keyboard.addListener("keyboardDidShow", (event) => {
      setAndroidKeyboardOffset(event.endCoordinates?.height || 0);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setAndroidKeyboardOffset(0);
    });

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

  // Show loading state while getting room ID
  if (loadingRoom || !actualRoomId) {
    return (
      <SafeAreaView className="flex-1 bg-white items-center justify-center">
        <StatusBar barStyle="dark-content" />
        <Text className="text-base text-secondary">{t("common.chat.loadingChat")}</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      edges={["top", "bottom", "left", "right"]}
    >
      <StatusBar barStyle="dark-content" />

      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={0}
      >
        {/* message content */}
        <View className="bg-[#E5F4FD80] flex-1">
          {/* Header */}
          <ChatScreenHeader
            title={chatTitle}
            avatar={chatAvatar}
            isOnline={chatIsOnline}
            onAudioCallPress={handleStartAudioCall}
            onVideoCallPress={handleStartVideoCall}
            onSeeProfilePress={handleSeeProfile}
            onToggleBlockUserPress={
              canBlockUser ? () => setConfirmAction("toggle-block") : undefined
            }
            onDeleteConversationPress={() => setConfirmAction("delete")}
            isBlocked={isBlocked}
            isStartingAudioCall={startingAudioCall}
            isStartingVideoCall={startingVideoCall}
            isTogglingBlockUser={isBlockingUser}
            isDeletingConversation={isDeletingConversation}
          />

          {/* Connection Status */}
          {!connected && (
            <View className="bg-yellow-100 px-4 py-2">
                <Text className="text-xs text-yellow-800 text-center font-proximanova-regular">
                {t("common.chat.connectingToChat")}
              </Text>
            </View>
          )}
          {isBlocked ? (
            <View className="bg-[#FEF3C7] px-4 py-2">
              <Text className="text-xs text-[#92400E] text-center font-proximanova-regular">
                {blockedByMe
                  ? t("common.chat.blockedByMeBanner")
                  : t("common.chat.blockedByOtherBanner")}
              </Text>
            </View>
          ) : null}

          {/* Job Card */}
          {shouldShowJobCard ? (
            <JobCard
              compact
              className="mx-5 bg-white border border-[#EEEEEE] mt-4"
              job={linkedRecruitment}
            />
          ) : null}

          {/* Messages */}
          <FlatList
            ref={messagesListRef}
            style={{ flex: 1 }}
            data={mappedMessages}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={{ paddingHorizontal: 16, paddingBottom: 12 }}
            showsVerticalScrollIndicator={false}
            inverted={false}
            onContentSizeChange={() => {
              if (!mappedMessages.length || didInitialScrollRef.current) return;
              scrollToBottom(false);
            }}
            onLayout={() => {
              if (!mappedMessages.length || didInitialScrollRef.current) return;
              scrollToBottom(false);
            }}
            renderItem={({ item: msg }) => (
              <>
                {msg.showDateSeparator ? (
                  <View className="flex-row items-center justify-center my-6">
                    <View className="h-[1px] flex-1 bg-[#D1D5DB]" />
                    <Text className="mx-4 text-xs font-proximanova-regular text-primary">
                      {msg.dateLabel}
                    </Text>
                    <View className="h-[1px] flex-1 bg-[#D1D5DB]" />
                  </View>
                ) : null}
                <RenderMessage
                  msg={msg}
                  onRetryMediaUpload={handleRetryMediaUpload}
                />
              </>
            )}
            ListEmptyComponent={
              loading ? (
                <View className="py-6 items-center">
                  <Text className="text-sm text-secondary">{t("common.chat.loadingMessages")}</Text>
                </View>
              ) : (
                <NoMessages />
              )
            }
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#4FB2F3"
              />
            }
            keyboardShouldPersistTaps="handled"
          />
        </View>

        <View style={{ marginBottom: Platform.OS === "android" ? androidKeyboardOffset : 0 }}>
          <TypingIndicator isTyping={isTyping} userName={typingUser || undefined} />

          {/* Input Bar */}
          <ChatInput
            message={message}
            setMessage={setMessage}
            onSend={handleSend}
            attachments={selectedMedia}
            onPickMedia={handlePickMedia}
            onRemoveMedia={handleRemoveSelectedMedia}
            onTyping={handleTyping}
            onStopTyping={handleStopTyping}
            isSending={sending}
            disabled={!connected || isBlocked}
          />
        </View>
      </KeyboardAvoidingView>

      <ChatActionConfirmModal
        visible={confirmAction !== null}
        title={
          confirmAction === "delete"
            ? t("common.chat.modalDeleteTitle")
            : isBlocked
              ? t("common.chat.modalUnblockTitle")
              : t("common.chat.modalBlockTitle")
        }
        subtitle={
          confirmAction === "delete"
            ? t("common.chat.modalDeleteSubtitle")
            : isBlocked
              ? t("common.chat.modalUnblockSubtitle")
              : t("common.chat.modalBlockSubtitle")
        }
        confirmLabel={
          confirmAction === "delete"
            ? t("common.chat.actionDelete")
            : isBlocked
              ? t("common.chat.actionUnblock")
              : t("common.chat.actionBlock")
        }
        confirmButtonClassName={
          confirmAction === "delete"
            ? "bg-[#EF4444]"
            : isBlocked
              ? "bg-[#11293A]"
              : "bg-[#EF4444]"
        }
        loading={isBlockingUser || isDeletingConversation}
        onClose={() => setConfirmAction(null)}
        onConfirm={() => {
          void handleConfirmAction();
        }}
      />
    </SafeAreaView>
  );
};

export default ChatScreen;
