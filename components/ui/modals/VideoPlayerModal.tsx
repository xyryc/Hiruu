import { VideoPlayerModalProps } from "@/types";
import { Entypo } from "@expo/vector-icons";
import { useVideoPlayer, VideoView } from "expo-video";
import React, { useEffect } from "react";
import { Modal, TouchableOpacity, View } from "react-native";

const VideoPlayerModal = ({ visible, videoUri, onClose }: VideoPlayerModalProps) => {
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
        <View className="absolute top-8 inset-x-0 items-center pt-4 pb-2">
          <TouchableOpacity onPress={onClose}>
            <View className="bg-[#000] rounded-full p-2.5">
              <Entypo name="cross" size={30} color="white" />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default VideoPlayerModal;
