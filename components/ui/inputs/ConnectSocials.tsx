import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { t } from "i18next";
import React, { useEffect, useMemo, useState } from "react";
import { Linking, Text, TextInput, TouchableOpacity, View } from "react-native";
import PhoneInput, {
  getCountryByCca2,
  getCountryByPhoneNumber,
  ICountry,
  isValidPhoneNumber,
} from "react-native-international-phone-number";
import SmallButton from "../buttons/SmallButton";

const SOCIAL_ITEMS = [
  { id: "facebook", label: t("common.connectSocials.facebook"), icon: require("@/assets/images/facebook2.svg") },
  { id: "linkedin", label: t("common.connectSocials.linkedin"), icon: require("@/assets/images/linkedin.svg") },
  { id: "whatsapp", label: t("common.connectSocials.whatsapp"), icon: require("@/assets/images/whatsapp.svg") },
  { id: "twitter", label: t("common.connectSocials.twitter"), icon: require("@/assets/images/twitter.svg") },
  { id: "telegram", label: t("common.connectSocials.telegram"), icon: require("@/assets/images/telegram.svg") },
  { id: "instagram", label: t("common.connectSocials.instagram"), icon: require("@/assets/images/instagram.svg") },
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

const getDialCode = (country?: ICountry | null) => {
  if (!country?.idd?.root) return "";
  const suffix = country.idd.suffixes?.[0] || "";
  return `${country.idd.root}${suffix}`;
};

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

const resolveOpenUrl = (key: SocialKey, rawValue?: string) => {
  if (!rawValue) return "";
  const value = rawValue.trim();
  if (!value) return "";

  if (value.startsWith("http://") || value.startsWith("https://")) {
    return value;
  }

  return normalizeSocialLink(key, value);
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
  const fallbackCountry = useMemo<ICountry | null>(() => getCountryByCca2("US") ?? null, []);
  const [localLinks, setLocalLinks] = useState<SocialLinks>(value || {});
  const [editingValues, setEditingValues] = useState<Record<string, string>>({});
  const [inputErrors, setInputErrors] = useState<Record<string, string>>({});
  const [selectedWhatsappCountry, setSelectedWhatsappCountry] = useState<ICountry | null>(fallbackCountry);
  const isControlled = typeof value !== "undefined";
  const links = useMemo(
    () => (isControlled ? (value || {}) : localLinks),
    [isControlled, localLinks, value]
  );

  useEffect(() => {
    if (!isControlled) return;
    setLocalLinks(value || {});
  }, [isControlled, value]);

  const updateLinks = (next: SocialLinks) => {
    if (!isControlled) {
      setLocalLinks(next);
    } else {
      // Keep local mirror in sync for immediate UI feedback.
      setLocalLinks(next);
    }
    onChange?.(next);
  };

  const visibleItems = hideEmpty
    ? SOCIAL_ITEMS.filter((item) => Boolean(links?.[item.id]))
    : SOCIAL_ITEMS;

  const startLink = (id: string) => {
    const key = id as SocialKey;
    const currentValue = links?.[key] || "";
    if (key === "whatsapp") {
      const digits = currentValue.replace(/[^\d]/g, "");
      if (digits) {
        const detectedCountry = getCountryByPhoneNumber(`+${digits}`) ?? fallbackCountry;
        setSelectedWhatsappCountry(detectedCountry);
        const detectedDialCode = getDialCode(detectedCountry).replace(/\D/g, "");
        const localNumber = detectedDialCode && digits.startsWith(detectedDialCode)
          ? digits.slice(detectedDialCode.length)
          : digits;
        setEditingValues((prev) => ({ ...prev, [id]: localNumber }));
      } else {
        setSelectedWhatsappCountry(fallbackCountry);
        setEditingValues((prev) => ({ ...prev, [id]: "" }));
      }
    } else {
      setEditingValues((prev) => ({ ...prev, [id]: currentValue }));
    }
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
      const countryToUse = selectedWhatsappCountry ?? fallbackCountry;
      if (!countryToUse || !isValidPhoneNumber(rawValue, countryToUse)) {
        setInputErrors((prev) => ({
          ...prev,
          [id]: t("common.connectSocials.invalidPhone"),
        }));
        return;
      }

      const localDigits = rawValue.replace(/[^\d]/g, "");
      const dialDigits = getDialCode(countryToUse).replace(/\D/g, "");
      const fullDigits = dialDigits && localDigits.startsWith(dialDigits)
        ? localDigits
        : `${dialDigits}${localDigits}`;

      if (!fullDigits) return;
      updateLinks({ ...(links || {}), [key]: `${SOCIAL_BASE_URL.whatsapp}${fullDigits}` });
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
      return;
    }

    const normalized = normalizeSocialLink(key, rawValue);
    if (!normalized) return;

    updateLinks({ ...(links || {}), [key]: normalized });
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
    updateLinks({ ...(links || {}), [key]: "" });
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
    setEditingValues((prev) => ({ ...prev, [id]: value }));
    setInputErrors((prev) => {
      if (!prev[id]) return prev;
      const next = { ...prev };
      delete next[id];
      return next;
    });
  };

  const handleOpenLink = async (key: SocialKey, rawValue?: string) => {
    const url = resolveOpenUrl(key, rawValue);
    if (!url) return;

    try {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) return;
      await Linking.openURL(url);
    } catch {
      // Ignore open-link failure silently to keep UI stable.
    }
  };

  return (
    <View className={`${className} border border-[#EEEEEE] rounded-xl`}>
      {visibleItems.length === 0 && hideEmpty ? (
        <View className="p-4">
          <Text className="text-sm font-proximanova-regular text-secondary">
            {t("common.connectSocials.noContactInfo")}
          </Text>
        </View>
      ) : null}

      {visibleItems.map((item, index) => {
        const isEditing = Object.prototype.hasOwnProperty.call(editingValues, item.id);
        const linkedValue = links?.[item.id] || "";
        const inputValue = editingValues[item.id] || "";

        return (
          <React.Fragment key={item.id}>
            <View
              className={`flex-row justify-between items-center p-3 ${index !== visibleItems.length - 1 ? "border-b border-[#EEEEEE]" : ""
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
                <View className="flex-row items-center gap-2 max-w-[72%]">
                  {PHONE_ONLY_SOCIALS.has(item.id) ? (
                    <View className="min-w-[180px] flex-1">
                      <PhoneInput
                        value={inputValue}
                        onChangePhoneNumber={(value) => updateDraft(item.id, value)}
                        selectedCountry={selectedWhatsappCountry}
                        onChangeSelectedCountry={setSelectedWhatsappCountry}
                        defaultCountry="US"
                        placeholder={t("common.connectSocials.enterPhone")}
                        phoneInputStyles={{
                          container: {
                            borderWidth: 1,
                            borderColor: "#D8D8D8",
                            borderRadius: 999,
                            backgroundColor: "transparent",
                            minHeight: 22,
                          },
                          input: {
                            fontSize: 12,
                            color: "#111827",
                            paddingVertical: 4,
                          },
                          divider: {
                            backgroundColor: "#E5E7EB",
                          },
                        }}
                      />
                    </View>
                  ) : (
                    <TextInput
                      value={inputValue}
                      onChangeText={(value) => updateDraft(item.id, value)}
                      placeholder={t("common.connectSocials.enterHandle", { platform: item.label })}
                      className="bg-white border border-[#D8D8D8] rounded-full px-3 py-2 text-xs min-w-[120px]"
                      keyboardType="default"
                    />
                  )}
                  <TouchableOpacity
                    onPress={() => confirmLink(item.id)}
                    className="w-8 h-8 rounded-full bg-[#11293A] items-center justify-center"
                  >
                    <Ionicons name="checkmark" size={16} color="#fff" />
                  </TouchableOpacity>
                </View>
              ) : linkedValue ? (
                <View className="flex-row items-center gap-2 max-w-[56%]">
                  <TouchableOpacity onPress={() => handleOpenLink(item.id, linkedValue)}>
                    <Text
                      className="text-sm font-proximanova-semibold text-[#2563EB] underline"
                      numberOfLines={1}
                    >
                      {toDisplayValue(item.id, linkedValue)}
                    </Text>
                  </TouchableOpacity>
                  {canEdit ? (
                    <TouchableOpacity onPress={() => removeLink(item.id)}>
                      <Ionicons name="close" size={24} color="#111827" />
                    </TouchableOpacity>
                  ) : null}
                </View>
              ) : hideEmpty || !canEdit ? null : (
                <SmallButton title={t("common.connectSocials.link")} onPress={() => startLink(item.id)} />
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
