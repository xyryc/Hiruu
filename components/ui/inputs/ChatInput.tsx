import {
  Feather,
  Ionicons,
  MaterialCommunityIcons,
  MaterialIcons,
} from "@expo/vector-icons";
import { ChatInputProps } from "@/types";
import { Image } from "expo-image";
import { EmojiSheetModule } from "expo-native-sheet-emojis";
import React from "react";
import {
  ActivityIndicator,
  I18nManager,
  Platform,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useColorScheme,
} from "react-native";

const ChatInput = ({
  message,
  setMessage,
  onSend,
  attachments = [],
  onPickMedia,
  onRemoveMedia,
  onTyping,
  onStopTyping,
  isSending = false,
  disabled = false,
}: ChatInputProps) => {
  const [typingTimeout, setTypingTimeout] = React.useState<NodeJS.Timeout | null>(null);
  const inputRef = React.useRef<TextInput | null>(null);
  const colorScheme = useColorScheme();

  const handleTextChange = (text: string) => {
    setMessage(text);

    if (onTyping && text.length > 0) {
      onTyping();

      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }

      const timeout = setTimeout(() => {
        if (onStopTyping) {
          onStopTyping();
        }
      }, 2000) as unknown as NodeJS.Timeout;

      setTypingTimeout(timeout);
    } else if (onStopTyping && text.length === 0) {
      onStopTyping();
    }
  };

  const handleSend = () => {
    const canSend = message.trim().length > 0 || attachments.length > 0;
    if (canSend && !isSending && !disabled && onSend) {
      onSend();
      if (onStopTyping) {
        onStopTyping();
      }
      if (typingTimeout) {
        clearTimeout(typingTimeout);
      }
    }
  };

  const handlePickEmoji = async () => {
    if (disabled || isSending) {
      return;
    }

    try {
      const result = await EmojiSheetModule.present({
        theme: colorScheme === "dark" ? "dark" : "light",
        layoutDirection: I18nManager.isRTL ? "rtl" : "ltr",
        showSearch: true,
      });

      if ("cancelled" in result) {
        return;
      }

      const next = `${message}${result.emoji}`;
      handleTextChange(next);
      inputRef.current?.focus();
    } catch (error) {
      console.error("[ChatInput] Failed to open emoji sheet:", error);
    }
  };

  return (
    <View className="px-4 py-3.5 border-t border-[#ECECEC]">
      {attachments.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {attachments.map((attachment) => (
            <View key={attachment.uri} className="relative">
              {attachment.previewType === "image" ? (
                <Image
                  source={{ uri: attachment.uri }}
                  style={{ width: 56, height: 56, borderRadius: 10 }}
                  contentFit="cover"
                />
              ) : (
                <View className="w-14 h-14 rounded-[10px] bg-[#11293A] items-center justify-center">
                  <Ionicons name="videocam" size={18} color="#fff" />
                  <Text className="text-[10px] text-white mt-0.5" numberOfLines={1}>
                    Video
                  </Text>
                </View>
              )}

              <TouchableOpacity
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 items-center justify-center"
                onPress={() => onRemoveMedia?.(attachment.uri)}
                disabled={isSending || disabled}
              >
                <Ionicons name="close" size={12} color="#fff" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      <View className="flex-row items-center gap-3">
        <View className="px-3.5 py-1.5 flex-1 bg-[#F5F5F5] rounded-full flex-row items-center gap-1.5 min-h-12">
          <TouchableOpacity disabled={disabled || isSending} onPress={handlePickEmoji}>
            <MaterialCommunityIcons
              name="emoticon-outline"
              size={22}
              color={disabled || isSending ? "#CCC" : "#111111"}
            />
          </TouchableOpacity>

          <TextInput
            ref={inputRef}
            value={message}
            onChangeText={handleTextChange}
            placeholder="Type Something...."
            placeholderTextColor="#999"
            className="flex-1 font-proximanova-regular text-sm text-secondary"
            style={{
              minHeight: 36,
              paddingTop: Platform.OS === "ios" ? 8 : 6,
              paddingBottom: Platform.OS === "ios" ? 8 : 6,
              includeFontPadding: false,
              textAlignVertical: "center",
            }}
            editable={!disabled && !isSending}
            multiline
            maxLength={1000}
            onSubmitEditing={handleSend}
            blurOnSubmit={false}
          />

          <TouchableOpacity disabled={disabled || isSending} onPress={onPickMedia}>
            <MaterialIcons
              name="attach-file"
              size={22}
              color={disabled || isSending ? "#CCC" : "#111111"}
            />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="w-12 h-12 bg-[#11293A] rounded-full items-center justify-center"
          onPress={handleSend}
          disabled={(!message.trim() && attachments.length === 0) || isSending || disabled || !onSend}
          style={{
            opacity:
              (!message.trim() && attachments.length === 0) || isSending || disabled || !onSend ? 0.5 : 1,
          }}
        >
          {isSending ? (
            <ActivityIndicator size="small" color="white" />
          ) : (
            <Feather name="send" size={18} color="white" />
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default ChatInput;
