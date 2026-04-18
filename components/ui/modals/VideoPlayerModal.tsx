import { Ionicons } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect } from "react";
import { Modal, TouchableOpacity, View } from "react-native";

interface VideoPlayerModalProps {
  visible: boolean;
  videoUri: string;
  onClose: () => void;
}

const VideoPlayerModal: React.FC<VideoPlayerModalProps> = ({ visible, videoUri, onClose }) => {
  const player = useVideoPlayer(videoUri, (p) => {
    p.loop = true;
    p.play();
  });

  // Stop video when modal closes
  useEffect(() => {
    if (!visible && player) {
      player.pause();
    }
  }, [visible, player]);

  // Play when visible becomes true and player is ready
  useEffect(() => {
    if (visible && player) {
      if (player.status === "readyToPlay") {
        player.play();
      } else if (player.status === "loading" || player.status === "idle") {
        const interval = setInterval(() => {
          if (player.status === "readyToPlay") {
            clearInterval(interval);
            player.play();
          }
        }, 500);

        return () => clearInterval(interval);
      }
    }
  }, [visible, player]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black justify-center items-center">
        <View style={{ width: "100%", height: "100%" }}>
          <VideoView
            player={player}
            style={{ width: "100%", height: "100%" }}
            contentFit="contain"
            nativeControls={true}
          />
        </View>
        <TouchableOpacity
          className="absolute top-12 right-4 p-2"
          onPress={onClose}
        >
          <Ionicons name="close" size={28} color="white" />
        </TouchableOpacity>
      </View>
    </Modal>
  );
};

export default VideoPlayerModal;
