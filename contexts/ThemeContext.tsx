import AsyncStorage from "@react-native-async-storage/async-storage";
import { colorScheme } from "nativewind"; // Import NativeWind's colorScheme
import React, { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  isDark: boolean;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const [theme, setThemeState] = useState<Theme>("light");

  const isDark = theme === "dark";

  const setTheme = (newTheme: Theme) => {
    console.log("🎯 setTheme called with:", newTheme);

    // Update React state
    setThemeState(newTheme);

    // 🔥 CRITICAL: Tell NativeWind about the theme change
    colorScheme.set(newTheme);

    // Save to storage
    AsyncStorage.setItem("app_theme", newTheme).catch(console.log);
  };

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = (await AsyncStorage.getItem("app_theme")) as Theme;
        if (savedTheme) {
          setThemeState(savedTheme);
          colorScheme.set(savedTheme); // 🔥 Set NativeWind theme on load
        } else {
          colorScheme.set("light"); // 🔥 Default to light
        }
      } catch (error) {
        console.log("Error loading theme:", error);
        colorScheme.set("light");
      }
    };
    loadTheme();
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, isDark, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider");
  }
  return context;
};
