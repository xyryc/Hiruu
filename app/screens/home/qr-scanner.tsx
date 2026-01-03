import ScreenHeader from "@/components/header/ScreenHeader";
import { Feather } from "@expo/vector-icons";
import { CameraType, CameraView, useCameraPermissions } from "expo-camera";
import { router } from "expo-router";
import { useColorScheme } from "nativewind";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const QrScanner = () => {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === "dark";
  const [isGenerating, setIsGenerating] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [scannedData, setScannedData] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraType>("back");
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, [permission]);

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
      console.log(`QR Code Type: ${type}, Data: ${data}`);
    }
  };

  const resetScanner = () => {
    setScanned(false);
    setScannedData(null);
    setIsModalVisible(false);
  };

  const toggleCameraFacing = () => {
    setFacing((current) => (current === "back" ? "front" : "back"));
  };

  const handleOpenScanner = () => {
    if (!permission) {
      Alert.alert("Error", "Camera permission not determined");
      return;
    }

    if (!permission.granted) {
      Alert.alert(
        "Camera Permission Required",
        "This app needs camera access to scan QR codes",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Allow", onPress: requestPermission },
        ]
      );
      return;
    }

    resetScanner();
    setIsModalVisible(true);
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
            </View>
          )}
        </View>

        {/* Scanner Controls */}
        <View className="flex-row justify-between items-center space-x-8 w-full">
          {/* Flash Toggle */}
          <TouchableOpacity className="items-center">
            <View className="w-16 h-16 bg-gray-200 dark:bg-gray-700 rounded-full items-center justify-center">
              <Feather name="zap" size={24} color={isDark ? "#fff" : "#111"} />
            </View>
            <Text className="text-gray-600 dark:text-gray-300 mt-2 text-xs">
              Flash
            </Text>
          </TouchableOpacity>

          {/* Camera Flip */}
          <TouchableOpacity
            className="items-center"
            onPress={toggleCameraFacing}
          >
            <View className="w-16 h-16 bg-primary dark:bg-dark-primary rounded-full items-center justify-center">
              <Feather name="refresh-ccw" size={24} color="white" />
            </View>
            <Text className="text-gray-600 dark:text-gray-300 mt-2 text-xs">
              Flip Camera
            </Text>
          </TouchableOpacity>

          {/* Gallery */}
          <TouchableOpacity className="items-center">
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

        {/* Manual Entry Option */}
        <TouchableOpacity
          className="mt-8"
          //   onPress={() => router.push("/screens/home/business/manual-entry")}
        >
          <Text className="text-primary dark:text-dark-primary text-lg font-semibold">
            Enter code manually
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
                onPress={() => {
                  setIsModalVisible(false);
                  // Handle the scanned data here
                  if (scannedData) {
                    Alert.alert("Success", "QR code processed successfully");
                  }
                }}
                className="flex-1 bg-primary dark:bg-dark-primary rounded-full py-3"
              >
                <Text className="text-white text-center font-semibold">
                  Use Data
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default QrScanner;
