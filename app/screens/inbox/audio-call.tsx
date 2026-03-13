import CallFooterControls from "@/components/call/CallFooterControls";
import CallHeaderInfo from "@/components/call/CallHeaderInfo";
import { useCallSession } from "@/hooks/useCallSession";
import React from "react";
import { StatusBar } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const AudioCallScreen = () => {
  const {
    joining,
    callStatusText,
    participantsCount,
    cameraOff,
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
  } = useCallSession();

  return (
    <SafeAreaView className="flex-1 bg-black">
      <StatusBar barStyle="light-content" />

      <CallHeaderInfo
        title="Audio Call"
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
        isVideoCall={false}
        onAccept={handleAccept}
        onReject={handleReject}
        onEnd={handleEnd}
        onToggleMute={handleToggleMute}
        onToggleSpeaker={handleToggleSpeaker}
        onToggleCamera={() => {}}
        onSwitchCamera={() => {}}
      />
    </SafeAreaView>
  );
};

export default AudioCallScreen;
