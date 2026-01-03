import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.log("Error caught:", error, errorInfo);
    // Log to error tracking service (Sentry, Bugsnag, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 items-center justify-center px-5 bg-white">
          <MaterialIcons name="error-outline" size={64} color="#FF6B6B" />
          <Text className="text-xl font-proximanova-bold text-primary mt-4 text-center">
            Oops! Something went wrong
          </Text>
          <Text className="text-sm font-proximanova-regular text-secondary mt-2 text-center">
            We're sorry for the inconvenience
          </Text>
          <TouchableOpacity
            onPress={() => this.setState({ hasError: false, error: null })}
            className="bg-primary px-6 py-3 rounded-lg mt-6"
          >
            <Text className="text-white font-proximanova-semibold">
              Try Again
            </Text>
          </TouchableOpacity>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
