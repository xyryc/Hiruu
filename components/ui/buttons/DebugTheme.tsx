// NUCLEAR DEBUG 1: Test if ANY style updates work at all
import { useTheme } from "@/contexts/ThemeContext";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export const NuclearTest1 = () => {
  const [localColor, setLocalColor] = useState("red");
  const { theme, setTheme } = useTheme();

  console.log("🔥 NuclearTest1 - theme:", theme, "localColor:", localColor);

  return (
    <View style={{ padding: 20, backgroundColor: "white" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
        NUCLEAR TEST 1: Basic Style Updates
      </Text>

      {/* Test 1: Local state style change (MUST work) */}
      <TouchableOpacity
        onPress={() => setLocalColor(localColor === "red" ? "blue" : "red")}
        style={{
          width: 100,
          height: 50,
          backgroundColor: localColor,
          marginBottom: 20,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>LOCAL</Text>
      </TouchableOpacity>

      {/* Test 2: Theme-based style (this might fail) */}
      <TouchableOpacity
        onPress={() => setTheme(theme === "light" ? "dark" : "light")}
        style={{
          width: 100,
          height: 50,
          backgroundColor: theme === "dark" ? "green" : "orange",
          marginBottom: 20,
          borderRadius: 10,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "white", fontWeight: "bold" }}>THEME</Text>
      </TouchableOpacity>

      <Text>Local Color: {localColor}</Text>
      <Text>Theme: {theme}</Text>
    </View>
  );
};

// NUCLEAR DEBUG 2: Force everything to update
export const NuclearTest2 = () => {
  const { theme, setTheme } = useTheme();
  const [forceUpdate, setForceUpdate] = useState(0);

  const handleToggle = () => {
    console.log("🔥 Before toggle:", theme);
    setTheme(theme === "light" ? "dark" : "light");
    setForceUpdate((prev) => prev + 1); // Force re-render
    console.log("🔥 After toggle");
  };

  console.log(
    "🔥 NuclearTest2 render - theme:",
    theme,
    "forceUpdate:",
    forceUpdate
  );

  // Calculate colors
  const bgColor = theme === "dark" ? "#10B981" : "#D1D5DB";
  const circlePosition = theme === "dark" ? 26 : 0;

  return (
    <View style={{ padding: 20, backgroundColor: "white" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
        NUCLEAR TEST 2: Force Update
      </Text>

      <Text style={{ marginBottom: 10 }}>Theme: {theme}</Text>
      <Text style={{ marginBottom: 10 }}>Force Update: {forceUpdate}</Text>
      <Text style={{ marginBottom: 10 }}>BG Color: {bgColor}</Text>
      <Text style={{ marginBottom: 20 }}>
        Circle Position: {circlePosition}
      </Text>

      <TouchableOpacity
        onPress={handleToggle}
        style={{
          width: 60,
          height: 34,
          borderRadius: 17,
          backgroundColor: bgColor,
          padding: 3,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "white",
            marginLeft: circlePosition,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

// NUCLEAR DEBUG 3: Check if it's a component mounting issue
export const NuclearTest3 = () => {
  const { theme, setTheme } = useTheme();
  const [componentKey, setComponentKey] = useState(0);

  const handleToggle = () => {
    setTheme(theme === "light" ? "dark" : "light");
    setComponentKey((prev) => prev + 1); // Force complete remount
  };

  return (
    <View style={{ padding: 20, backgroundColor: "white" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
        NUCLEAR TEST 3: Component Remount
      </Text>

      <Text style={{ marginBottom: 20 }}>
        Component Key: {componentKey} | Theme: {theme}
      </Text>

      <ToggleComponent key={componentKey} onToggle={handleToggle} />
    </View>
  );
};

const ToggleComponent = ({ onToggle }: { onToggle: () => void }) => {
  const { theme } = useTheme();

  console.log("🔥 ToggleComponent mounted with theme:", theme);

  return (
    <TouchableOpacity
      onPress={onToggle}
      style={{
        width: 60,
        height: 34,
        borderRadius: 17,
        backgroundColor: theme === "dark" ? "#10B981" : "#D1D5DB",
        padding: 3,
        justifyContent: "center",
      }}
    >
      <View
        style={{
          width: 28,
          height: 28,
          borderRadius: 14,
          backgroundColor: "white",
          marginLeft: theme === "dark" ? 26 : 0,
        }}
      />
    </TouchableOpacity>
  );
};

// NUCLEAR DEBUG 4: Test the exact issue - compare working vs broken
export const NuclearTest4 = () => {
  const { theme, setTheme } = useTheme();
  const [localTheme, setLocalTheme] = useState("light");

  return (
    <View style={{ padding: 20, backgroundColor: "white" }}>
      <Text style={{ fontSize: 20, fontWeight: "bold", marginBottom: 20 }}>
        NUCLEAR TEST 4: Side by Side Comparison
      </Text>

      <Text style={{ marginBottom: 10 }}>Context Theme: {theme}</Text>
      <Text style={{ marginBottom: 20 }}>Local Theme: {localTheme}</Text>

      {/* Working Toggle (Local State) */}
      <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
        LOCAL STATE (Should Work):
      </Text>
      <TouchableOpacity
        onPress={() => setLocalTheme(localTheme === "light" ? "dark" : "light")}
        style={{
          width: 60,
          height: 34,
          borderRadius: 17,
          backgroundColor: localTheme === "dark" ? "#10B981" : "#D1D5DB",
          padding: 3,
          justifyContent: "center",
          marginBottom: 30,
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "white",
            marginLeft: localTheme === "dark" ? 26 : 0,
          }}
        />
      </TouchableOpacity>

      {/* Context Toggle (Broken) */}
      <Text style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}>
        CONTEXT STATE (Broken):
      </Text>
      <TouchableOpacity
        onPress={() => setTheme(theme === "light" ? "dark" : "light")}
        style={{
          width: 60,
          height: 34,
          borderRadius: 17,
          backgroundColor: theme === "dark" ? "#10B981" : "#D1D5DB",
          padding: 3,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "white",
            marginLeft: theme === "dark" ? 26 : 0,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};

// NUCLEAR DEBUG 5: Check if it's your specific component or global issue
export const MegaNuclearTest = () => {
  return (
    <View style={{ flex: 1, backgroundColor: "white" }}>
      <Text
        style={{
          fontSize: 24,
          fontWeight: "bold",
          textAlign: "center",
          margin: 20,
        }}
      >
        🚀 MEGA NUCLEAR DEBUG
      </Text>

      <NuclearTest1 />
      <View style={{ height: 2, backgroundColor: "#E5E7EB", margin: 20 }} />

      <NuclearTest2 />
      <View style={{ height: 2, backgroundColor: "#E5E7EB", margin: 20 }} />

      <NuclearTest3 />
      <View style={{ height: 2, backgroundColor: "#E5E7EB", margin: 20 }} />

      <NuclearTest4 />
    </View>
  );
};

// NUCLEAR SOLUTION: If nothing else works, create a wrapper that forces updates
export const NuclearSolutionToggle = () => {
  const themeContext = useTheme();
  const [internalState, setInternalState] = useState({
    theme: themeContext.theme,
    isDark: themeContext.isDark,
  });

  // Force sync with context
  React.useEffect(() => {
    const newState = {
      theme: themeContext.theme,
      isDark: themeContext.isDark,
    };
    setInternalState(newState);
    console.log("🔥 Nuclear Solution - synced state:", newState);
  }, [themeContext.theme, themeContext.isDark]);

  const handleToggle = () => {
    const newTheme = internalState.theme === "light" ? "dark" : "light";
    console.log("🔥 Nuclear Solution - toggling to:", newTheme);
    themeContext.setTheme(newTheme);
  };

  console.log("🔥 Nuclear Solution render:", internalState);

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>
        NUCLEAR SOLUTION:
      </Text>
      <Text style={{ marginBottom: 20 }}>
        Internal: {internalState.theme} | Context: {themeContext.theme}
      </Text>

      <TouchableOpacity
        onPress={handleToggle}
        style={{
          width: 60,
          height: 34,
          borderRadius: 17,
          backgroundColor: internalState.isDark ? "#10B981" : "#D1D5DB",
          padding: 3,
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 28,
            height: 28,
            borderRadius: 14,
            backgroundColor: "white",
            marginLeft: internalState.isDark ? 26 : 0,
          }}
        />
      </TouchableOpacity>
    </View>
  );
};
