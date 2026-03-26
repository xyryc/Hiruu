import { Image } from "expo-image";
import { Ionicons } from "@expo/vector-icons";
import React, { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import SmallButton from "../buttons/SmallButton";

const SOCIAL_ITEMS = [
  { id: "facebook", label: "Facebook", icon: require("@/assets/images/facebook2.svg") },
  { id: "linkedin", label: "LinkedIn", icon: require("@/assets/images/linkedin.svg") },
  { id: "whatsapp", label: "WhatsApp", icon: require("@/assets/images/whatsapp.svg") },
  { id: "twitter", label: "Twitter", icon: require("@/assets/images/twitter.svg") },
  { id: "telegram", label: "Telegram", icon: require("@/assets/images/telegram.svg") },
  { id: "instagram", label: "Instagram", icon: require("@/assets/images/instagram.svg") },
] as const;

type SocialKey = (typeof SOCIAL_ITEMS)[number]["id"];
type SocialLinks = Partial<Record<SocialKey, string>>;

const PHONE_ONLY_SOCIALS = new Set<SocialKey>(["whatsapp"]);

const SOCIAL_BASE_URL: Record<SocialKey, string> = {
  facebook: "https://facebook.com/",
  linkedin: "https://linkedin.com/in/",
  whatsapp: "https://wa.me/",
  twitter: "https://x.com/",
  telegram: "https://t.me/",
  instagram: "https://instagram.com/",
};

const sanitizeHandle = (value: string) =>
  value.trim().replace(/^@+/, "").replace(/^\/+/, "");

const normalizeSocialLink = (key: SocialKey, rawValue: string) => {
  const value = rawValue.trim();
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  if (key === "whatsapp") {
    const digits = value.replace(/[^\d]/g, "");
    return digits ? `${SOCIAL_BASE_URL.whatsapp}${digits}` : "";
  }

  return `${SOCIAL_BASE_URL[key]}${sanitizeHandle(value)}`;
};

const toDisplayValue = (key: SocialKey, value?: string) => {
  if (!value) return "";

  if (key === "whatsapp") {
    const digits = value.replace(/[^\d+]/g, "");
    return digits || value;
  }

  try {
    const parsed = new URL(value);
    const pathPart = parsed.pathname.split("/").filter(Boolean).pop();
    if (pathPart) return `@${sanitizeHandle(pathPart)}`;
  } catch {
    // Fall through to plain string handling.
  }

  const cleaned = sanitizeHandle(value);
  return cleaned ? `@${cleaned}` : value;
};

const ConnectSocials = ({
  className,
  value,
  onChange,
  hideEmpty = false,
  canEdit = true,
}: {
  className?: string;
  value?: SocialLinks;
  onChange?: (next: SocialLinks) => void;
  hideEmpty?: boolean;
  canEdit?: boolean;
}) => {
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});
  const visibleItems = hideEmpty
    ? SOCIAL_ITEMS.filter((item) => Boolean(value?.[item.id]))
    : SOCIAL_ITEMS;

  const startLink = (id: string) => {
    const key = id as SocialKey;
    const currentValue = value?.[key] || "";
    setEditingValues((prev) => ({ ...prev, [id]: currentValue }));
    setInputErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const confirmLink = (id: string) => {
    const key = id as SocialKey;
    const rawValue = editingValues[id] || "";

    if (PHONE_ONLY_SOCIALS.has(key)) {
      const digits = rawValue.replace(/[^\d]/g, "");
      if (!digits || digits.length < 7) {
        setInputErrors((prev) => ({
          ...prev,
          [id]: "Enter a valid phone number",
        }));
        return;
      }
    }

    const normalized = normalizeSocialLink(key, rawValue);
    if (!normalized) return;

    onChange?.({ ...(value || {}), [key]: normalized });
    setEditingValues((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setInputErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const removeLink = (id: string) => {
    const key = id as SocialKey;
    onChange?.({ ...(value || {}), [key]: "" });
    setEditingValues((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setInputErrors((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const updateDraft = (id: string, value: string) => {
    const key = id as SocialKey;
    const nextValue = PHONE_ONLY_SOCIALS.has(key)
      ? value.replace(/[^\d]/g, "")
      : value;

    setEditingValues((prev) => ({ ...prev, [id]: nextValue }));
    setInputErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  return (
    <View className={`${className} border border-[#EEEEEE] rounded-xl`}>
      {visibleItems.length === 0 && hideEmpty ? (
        <View className="p-4">
          <Text className="text-sm font-proximanova-regular text-secondary">
            No contact information available.
          </Text>
        </View>
      ) : null}

      {visibleItems.map((item, index) => {
        const isEditing = Object.prototype.hasOwnProperty.call(editingValues, item.id);
        const linkedValue = value?.[item.id] || "";
        const inputValue = editingValues[item.id] || "";

        return (
          <React.Fragment key={item.id}>
            <View
              className={`flex-row justify-between items-center p-3 ${
                index !== visibleItems.length - 1 ? "border-b border-[#EEEEEE]" : ""
              }`}
            >
              <TouchableOpacity className="flex-row items-center gap-1.5">
                <Image
                  style={{ height: 36, width: 36 }}
                  source={item.icon}
                  contentFit="contain"
                />
                <Text className="text-sm font-proximanova-semibold">{item.label}</Text>
              </TouchableOpacity>

              {isEditing && canEdit ? (
                <View className="flex-row items-center gap-2 max-w-[56%]">
                  <TextInput
                    value={inputValue}
                    onChangeText={(value) => updateDraft(item.id, value)}
                    placeholder={
                      PHONE_ONLY_SOCIALS.has(item.id)
                        ? "Enter phone number"
                        : `Enter ${item.label}`
                    }
                    className="bg-white border border-[#D8D8D8] rounded-full px-3 py-2 text-xs min-w-[120px]"
                    keyboardType={
                      PHONE_ONLY_SOCIALS.has(item.id) ? "phone-pad" : "default"
                    }
                  />
                  <TouchableOpacity
                    onPress={() => confirmLink(item.id)}
                    className="w-8 h-8 rounded-full bg-[#11293A] items-center justify-center"
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : linkedValue ? (
                <View className="flex-row items-center gap-2 max-w-[56%]">
                  <Text className="text-sm font-proximanova-semibold text-primary" numberOfLines={1}>
                    {toDisplayValue(item.id, linkedValue)}
                  </Text>
                  {canEdit ? (
                    <TouchableOpacity onPress={() => removeLink(item.id)}>
                      <Ionicons name="close" size={24} color="#111827" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : hideEmpty || !canEdit ? null : (
                <SmallButton title="Link" onPress={() => startLink(item.id)} />
              )}
            </View>

            {isEditing && inputErrors[item.id] ? (
              <View className="px-3 pb-2">
                <Text className="text-xs text-[#F34F4F] font-proximanova-regular text-right">
                  {inputErrors[item.id]}
                </Text>
              </View>
            ) : null}
          </React.Fragment>
        );
      })}
    </View>
  );
};

export default ConnectSocials;
