import ScreenHeader from "@/components/header/ScreenHeader";
import { useBusinessStore } from "@/stores/businessStore";
import { translateApiMessage } from "@/utils/apiMessages";
import { Feather } from "@expo/vector-icons";
import { Camera, CameraType, CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Linking,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { toast } from "sonner-native";

const QrScanner = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const facing: CameraType = "back";
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [flashMode, setFlashMode] = useState<"off" | "on" | "auto">("off");

  const { joinBusiness, isJoiningBusiness } = useBusinessStore();

  useEffect(() => {
    if (permission?.status === "undetermined") {
      requestPermission();
    }
  }, [permission?.status, requestPermission]);

  const handleBarCodeScanned = ({
    type,
    data,
  }: {
    type: string;
    data: string;
  }) => {
    if (!scanned) {
      setScanned(true);
      setScannedData(data);
      setIsModalVisible(true);

      // Process the scanned data
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScannedData(null);
    setIsModalVisible(false);
  };

  const toggleFlash = () => {
    setFlashMode((prev) => (prev === "on" ? "off" : "on"));
  };

  if (!permission) {
    return (
      <SafeAreaView className="flex-1 bg-[#FFFFFF] dark:bg-dark-background justify-center items-center">
        <ActivityIndicator size="large" color={isDark ? "#fff" : "#111"} />
        <Text className="text-gray-600 dark:text-gray-300 mt-4">
          Checking camera permissions...
        </Text>
      </SafeAreaView>
    );
  }

  const pickImageFromGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(
        "Permission Denied",
        "Permission to access media library is required."
      );
      return;
    }

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });

      if (result.canceled || !result.assets?.length) return;

      const imageUri = result.assets[0].uri;

      const scannedResults = await Camera.scanFromURLAsync(imageUri, [
        "qr",
        "pdf417",
        "ean13",
        "upc_e",
      ]);

      if (scannedResults.length > 0) {
        setScannedData(scannedResults[0].data);
        setIsModalVisible(true);
        setScanned(true);
      } else {
        Alert.alert(
          "No QR Code Found",
          "No QR code was detected in the selected image."
        );
      }
    } catch (error) {
      console.error("Gallery scan error:", error);
      Alert.alert("Error", "Failed to scan QR code from image.");
    }
  };

  const parseJoinBusinessQR = (data: string) => {
    try {
      const url = new URL(data);

      const invitationCode = url.searchParams.get("inviteCode");

      if (!invitationCode) {
        throw new Error("Invalid QR code");
      }

      return { invitationCode };
    } catch {
      return null;
    }
  };

  return (
    <SafeAreaView
      className="flex-1 bg-[#FFFFFF] dark:bg-dark-background"
      edges={["left", "right", "bottom"]}
    >
      {/* Header */}
      <View className="bg-[#E5F4FD] dark:bg-dark-border rounded-b-2xl pt-10 px-5">
        <ScreenHeader
          className="my-4"
          onPressBack={() => router.back()}
          title="QR Scanner"
          titleClass="text-primary dark:text-dark-primary"
          iconColor={isDark ? "#fff" : "#111"}
        />
      </View>

      {/* Main Content */}
      <View className="flex-1 justify-center items-center px-5">
        {/* Scanner Preview */}
	        <View className="w-full aspect-square rounded-2xl overflow-hidden mb-8">
	          {permission.granted ? (
            <CameraView
              style={{ flex: 1 }}
              facing={facing}
              onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
              barcodeScannerSettings={{
                barcodeTypes: ["qr", "pdf417", "ean13", "upc_e"],
              }}
              enableTorch={flashMode === "on"}
            >
              {/* Scanner Frame Overlay */}
              <View className="flex-1 justify-center items-center bg-black/30">
                <View className="w-64 h-64 border-2 border-white rounded-2xl relative">
                  {/* Corner borders */}
                  <View className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-white rounded-tl" />
                  <View className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-white rounded-tr" />
                  <View className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-white rounded-bl" />
                  <View className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-white rounded-br" />
                </View>

                <Text className="text-white text-lg font-semibold mt-8 text-center">
                  Position QR code within the frame
                </Text>
              </View>
            </CameraView>
	          ) : (
	            <View className="flex-1 bg-gray-200 dark:bg-gray-800 justify-center items-center">
	              <Feather
	                name="camera-off"
	                size={64}
	                color={isDark ? "#9CA3AF" : "#6B7280"}
	              />
	              <Text className="text-gray-600 dark:text-gray-400 text-center mt-4 text-lg">
	                Camera access required
	              </Text>
	              <TouchableOpacity
	                className="mt-4 px-5 py-3 rounded-full bg-primary dark:bg-dark-primary"
	                onPress={() => {
	                  if (permission.canAskAgain) {
	                    requestPermission();
	                    return;
	                  }
	                  Linking.openSettings();
	                }}
	              >
	                <Text className="text-white font-proximanova-semibold">
	                  {permission.canAskAgain ? "Allow Camera" : "Open Settings"}
	                </Text>
	              </TouchableOpacity>
	            </View>
	          )}
	        </View>

        {/* Scanner Controls */}
        <View className="flex-row justify-between items-center space-x-8 w-full">
          {/* Flash Toggle */}
          <TouchableOpacity className="items-center" onPress={toggleFlash}>
            <View
              className={`w-16 h-16 rounded-full items-center justify-center ${flashMode === "on"
                ? "bg-yellow-400"
                : "bg-gray-200 dark:bg-gray-700"
                }`}
            >
              <Feather
                name="zap"
                size={24}
                color={flashMode === "on" ? "#000" : isDark ? "#fff" : "#111"}
              />
            </View>
            <Text className="text-gray-600 dark:text-gray-300 mt-2 text-xs">
              Flash {flashMode === "on" ? "ON" : "OFF"}
            </Text>
          </TouchableOpacity>

          {/* Gallery */}
          <TouchableOpacity
            className="items-center"
            onPress={pickImageFromGallery}
          >
            <View className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center">
              <Feather
                name="image"
                size={24}
                color={isDark ? "#fff" : "#111"}
              />
            </View>
            <Text className="text-gray-600 dark:text-gray-300 mt-2 text-xs">
              Gallery
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push("/screens/home/qr/enter-code")}
          className="mt-6 py-2"
        >
          <Text className="text-sm font-proximanova-semibold text-[#4FB2F3] text-center">
            Enter invite code instead
          </Text>
        </TouchableOpacity>
      </View>

      {/* Scan Result Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={resetScanner}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white dark:bg-dark-card rounded-2xl p-6 mx-4 w-11/12">
            <Text className="text-xl font-bold text-gray-900 dark:text-white text-center mb-4">
              QR Code Scanned
            </Text>

            <View className="bg-gray-50 dark:bg-gray-800 rounded-xl p-4 mb-6">
              <Text className="text-gray-900 dark:text-white text-center break-words">
                {scannedData}
              </Text>
            </View>

            <View className="flex-row space-x-3">
              <TouchableOpacity
                onPress={resetScanner}
                className="flex-1 border border-gray-300 dark:border-gray-600 rounded-full py-3"
              >
                <Text className="text-gray-700 dark:text-gray-300 text-center font-semibold">
                  Scan Again
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={isJoiningBusiness}
                onPress={async () => {
                  if (isJoiningBusiness) return;
                  if (!scannedData) return;

                  const parsed = parseJoinBusinessQR(scannedData);

                  if (!parsed) {
                    Alert.alert("Invalid QR", "This QR code is not valid for joining a business.");
                    return;
                  }
                  try {
                    await joinBusiness(parsed.invitationCode);

                    toast.success("You joined the business successfully!");
                    resetScanner();
                    router.back();
                  } catch (err: any) {
                    toast.error(translateApiMessage(err?.message || "Failed to join business"));
                  }
                }}

                className={`flex-1 rounded-full py-3 ${isJoiningBusiness ? "bg-secondary" : "bg-primary dark:bg-dark-primary"}`}
              >
                {isJoiningBusiness ? (
                  <View className="flex-row items-center justify-center gap-2">
                    <Text className="text-white text-center font-semibold">
                      Joining...
                    </Text>
                  </View>
                ) : (
                  <Text className="text-white text-center font-semibold">
                    Use Data
                  </Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default QrScanner;
