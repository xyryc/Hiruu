import React from "react";
import { View, Text } from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import PrimaryButton from "../buttons/PrimaryButton";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
    // Log to error tracking service (Sentry, Bugsnag, etc.)
  }

  render() {
    if (this.state.hasError) {
      return (
        <View className="flex-1 justify-center bg-[#F7FBFF] px-5 dark:bg-dark-background">
          <View className="rounded-3xl border border-[#4FB2F350] bg-white p-6 dark:border-[#4FB2F340] dark:bg-dark-secondary">
            <View className="mx-auto h-16 w-16 items-center justify-center rounded-full bg-[#FFE9E9]">
              <MaterialIcons name="error-outline" size={34} color="#E5484D" />
            </View>

            <Text className="mt-4 text-center text-xl font-proximanova-bold text-primary dark:text-dark-primary">
              Oops! Something went wrong
            </Text>
            <Text className="mt-2 text-center text-sm font-proximanova-regular text-secondary dark:text-dark-secondary">
              We&apos;re sorry for the inconvenience. Please try again.
            </Text>

            <PrimaryButton
              className="mt-6 h-12"
              title="Try Again"
              showIcon={false}
              onPress={() => this.setState({ hasError: false, error: null })}
            />
          </View>
        </View>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
