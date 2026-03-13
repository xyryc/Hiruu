import CallFooterControls from "@/components/call/CallFooterControls";
import CallHeaderInfo from "@/components/call/CallHeaderInfo";
import VideoCallStage from "@/components/call/VideoCallStage";
import { useCallSession } from "@/hooks/useCallSession";
import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const VideoCallScreen = () => {
  const {
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
  } = useCallSession();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <VideoCallStage
        remoteVideoUid={remoteVideoUid}
        cameraOff={cameraOff}
        localJoinedAgora={localJoinedAgora}
        RemoteVideoView={RemoteVideoView}
        LocalVideoView={LocalVideoView}
      />

      <CallHeaderInfo
        title="Video Call"
        statusText={callStatusText}
        participantsCount={participantsCount}
        joining={joining}
      />

      <CallFooterControls
        isIncomingPending={isIncomingPending}
        accepting={accepting}
        rejecting={rejecting}
        ending={ending}
        muted={muted}
        speakerOn={speakerOn}
        cameraOff={cameraOff}
        isVideoCall
        onAccept={handleAccept}
        onReject={handleReject}
        onEnd={handleEnd}
        onToggleMute={handleToggleMute}
        onToggleSpeaker={handleToggleSpeaker}
        onToggleCamera={handleToggleCamera}
        onSwitchCamera={handleSwitchCamera}
      />
    </SafeAreaView>
  );
};

export default VideoCallScreen;
