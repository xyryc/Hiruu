import React from "react";
import { Text, View } from "react-native";
import { RenderModeType, VideoSourceType } from "react-native-agora";

type Props = {
  remoteVideoUids: number[];
  cameraOff: boolean;
  localJoinedAgora: boolean;
  RemoteVideoView: any;
  LocalVideoView: any;
};

const VideoCallStage = ({
  remoteVideoUids,
  cameraOff,
  localJoinedAgora,
  RemoteVideoView,
  LocalVideoView,
}: Props) => {
  const remoteCount = remoteVideoUids.length;
  const columns = remoteCount <= 1 ? 1 : remoteCount <= 4 ? 2 : 3;
  const rows = Math.max(1, Math.ceil(remoteCount / columns));
  const tileWidth = `${100 / columns}%` as const;
  const tileHeight = `${100 / rows}%` as const;

  return (
    <View className="absolute inset-0">
      {remoteCount > 0 ? (
        <View style={{ flex: 1, flexDirection: "row", flexWrap: "wrap" }}>
          {remoteVideoUids.map((uid) => (
            <View
              key={uid}
              style={{
                width: tileWidth,
                height: tileHeight,
                borderWidth: 0.5,
                borderColor: "rgba(255,255,255,0.25)",
                overflow: "hidden",
                backgroundColor: "#000000",
              }}
            >
              <RemoteVideoView
                canvas={{
                  uid,
                  renderMode: RenderModeType.RenderModeHidden,
                  sourceType: VideoSourceType.VideoSourceRemote,
                }}
                style={{ flex: 1 }}
              />
            </View>
          ))}
        </View>
      ) : (
        <View className="flex-1 items-center justify-center bg-black">
          <Text className="font-proximanova-regular text-[#CBD5E1]">Waiting for video...</Text>
        </View>
      )}

      <View
        style={{
          position: "absolute",
          right: 12,
          top: 100,
          width: 110,
          height: 160,
          borderRadius: 14,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.25)",
          backgroundColor: "#111827",
        }}
      >
        {cameraOff || !localJoinedAgora ? (
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <Text className="font-proximanova-regular text-[10px] text-[#CBD5E1]">
              {cameraOff ? "Camera off" : "Connecting..."}
            </Text>
          </View>
        ) : (
          <LocalVideoView
            zOrderMediaOverlay
            canvas={{
              uid: 0,
              renderMode: RenderModeType.RenderModeHidden,
              sourceType: VideoSourceType.VideoSourceCameraPrimary,
            }}
            style={{ flex: 1 }}
          />
        )}
      </View>
    </View>
  );
};

export default VideoCallStage;
