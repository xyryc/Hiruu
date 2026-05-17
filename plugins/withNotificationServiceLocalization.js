const fs = require("fs");
const path = require("path");
const {
  withDangerousMod,
  withXcodeProject,
  createRunOncePlugin,
} = require("@expo/config-plugins");
const {
  ensureGroupRecursively,
  addBuildSourceFileToGroup,
  addResourceFileToGroup,
} = require("@expo/config-plugins/build/ios/utils/Xcodeproj");

const IOS_TARGET_NAME = "NotificationService";
const PLUGIN_NAME = "with-notification-service-localization";
const PLUGIN_VERSION = "1.0.0";
const DEFAULT_EXTENSION_BUNDLE_SUFFIX = "nsext";

const REQUIRED_EVENTS = [
  "chat_message.chat_message",
  "call_incoming.call_incoming",
  "shift_assigned.shift_assigned",
  "shift_cancelled.shift_cancelled",
  "clock_in_reminder.clock_in_reminder",
  "shift_changed.shift_request_created",
  "shift_changed.shift_request_approved",
  "shift_changed.shift_request_rejected",
  "coins_earned.monthly_leaderboard_reward",
  "achievement_unlocked.achievement_unlocked",
  "achievement_unlocked.badge_tier_unlocked",
  "leave_approved.leave_approved",
  "leave_rejected.leave_rejected",
  "business_announcement.employee_joined_business",
  "business_announcement.recruitment_application_received",
  "business_announcement.recruitment_offer_received",
  "support_ticket_update.support_started",
  "system_maintenance.manual_test",
  "system_maintenance.subscription_purchased",
  "shift_swap_requested.shift_swap_requested",
  "shift_swap_approved.shift_swap_approved",
  "shift_swap_rejected.shift_swap_rejected",
];

const toEscapedStringsValue = (value) =>
  String(value)
    .replace(/\\/g, "\\\\")
    .replace(/"/g, '\\"')
    .replace(/\n/g, "\\n");

const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
};

const normalizeLocaleForIOS = (localeCode) => {
  if (localeCode === "gr") return "el";
  return localeCode;
};

const getNested = (obj, keys) =>
  keys.reduce(
    (acc, key) => (acc && acc[key] != null ? acc[key] : undefined),
    obj,
  );

const readLocaleJson = (projectRoot, localeCode) => {
  const filepath = path.join(projectRoot, "locales", `${localeCode}.json`);
  if (!fs.existsSync(filepath)) return null;
  return JSON.parse(fs.readFileSync(filepath, "utf8"));
};

const collectNotificationEntries = (localeJson, fallbackJson) => {
  const entries = {};
  for (const id of REQUIRED_EVENTS) {
    const [type, event] = id.split(".");
    const titleKey = ["notifications", "events", type, event, "title"];
    const bodyKey = ["notifications", "events", type, event, "body"];

    const title =
      getNested(localeJson, titleKey) ?? getNested(fallbackJson, titleKey);
    const body =
      getNested(localeJson, bodyKey) ?? getNested(fallbackJson, bodyKey);

    entries[`notifications.events.${type}.${event}.title`] =
      title || "Notification";
    entries[`notifications.events.${type}.${event}.body`] =
      body || "You have a new notification.";
  }

  entries["notifications.fallback.title"] = "Notification";
  entries["notifications.fallback.body"] = "You have a new notification.";

  return entries;
};

const toLocalizableStrings = (entries) => {
  const lines = [];
  for (const key of Object.keys(entries).sort()) {
    lines.push(
      `"${toEscapedStringsValue(key)}" = "${toEscapedStringsValue(entries[key])}";`,
    );
  }
  lines.push("");
  return lines.join("\n");
};

const getSwiftSource = () =>
  `
import Foundation
import UserNotifications

final class NotificationService: UNNotificationServiceExtension {
  private var contentHandler: ((UNNotificationContent) -> Void)?
  private var bestAttemptContent: UNMutableNotificationContent?

  override func didReceive(
    _ request: UNNotificationRequest,
    withContentHandler contentHandler: @escaping (UNNotificationContent) -> Void
  ) {
    self.contentHandler = contentHandler
    bestAttemptContent = (request.content.mutableCopy() as? UNMutableNotificationContent)

    guard let bestAttemptContent = bestAttemptContent else {
      contentHandler(request.content)
      return
    }

    let userInfo = request.content.userInfo
    let type = stringValue(userInfo["type"]) ?? ""
    let event = stringValue(userInfo["event"]) ?? ""

    let metadata = parseJSONObject(from: userInfo["metadata"]) ?? [:]

    var interpolation = metadata
    if interpolation["formattedShiftDate"] == nil,
       let shiftDate = interpolation["shiftDate"] as? String,
       !shiftDate.isEmpty {
      interpolation["formattedShiftDate"] = formatShiftDate(shiftDate)
    }

    let titleKey = "notifications.events.\\(type).\\(event).title"
    let bodyKey = "notifications.events.\\(type).\\(event).body"

    let fallbackTitle =
      stringValue(userInfo["title"]) ??
      request.content.title

    let fallbackBody =
      stringValue(userInfo["message"]) ??
      stringValue(userInfo["body"]) ??
      request.content.body

    let resolvedTitle = localizedText(
      key: titleKey,
      vars: interpolation,
      fallback: fallbackTitle.isEmpty ? "Notification" : fallbackTitle
    )

    let resolvedBody = localizedText(
      key: bodyKey,
      vars: interpolation,
      fallback: fallbackBody.isEmpty ? "You have a new notification." : fallbackBody
    )

    bestAttemptContent.title = resolvedTitle
    bestAttemptContent.body = resolvedBody
    bestAttemptContent.userInfo = userInfo

    contentHandler(bestAttemptContent)
  }

  override func serviceExtensionTimeWillExpire() {
    if let contentHandler = contentHandler, let bestAttemptContent = bestAttemptContent {
      contentHandler(bestAttemptContent)
    }
  }

  private func localizedText(key: String, vars: [String: Any], fallback: String) -> String {
    let template = NSLocalizedString(key, tableName: nil, bundle: Bundle.main, value: fallback, comment: "")
    return interpolate(template: template, vars: vars)
  }

  private func interpolate(template: String, vars: [String: Any]) -> String {
    var result = template
    for (k, v) in vars {
      result = result.replacingOccurrences(of: "{{\\(k)}}", with: "\\(v)")
    }
    return result
  }

  private func stringValue(_ value: Any?) -> String? {
    guard let value else { return nil }
    if let string = value as? String {
      let trimmed = string.trimmingCharacters(in: .whitespacesAndNewlines)
      return trimmed.isEmpty ? nil : trimmed
    }
    return nil
  }

  private func parseJSONObject(from value: Any?) -> [String: Any]? {
    if let dict = value as? [String: Any] {
      return dict
    }

    guard let raw = value as? String,
          let data = raw.data(using: .utf8) else {
      return nil
    }

    let parsed = try? JSONSerialization.jsonObject(with: data, options: [])
    return parsed as? [String: Any]
  }

  private func formatShiftDate(_ raw: String) -> String {
    let parser = ISO8601DateFormatter()
    parser.formatOptions = [.withInternetDateTime, .withFractionalSeconds]

    var date = parser.date(from: raw)
    if date == nil {
      parser.formatOptions = [.withInternetDateTime]
      date = parser.date(from: raw)
    }

    if date == nil {
      let fallbackFormatter = DateFormatter()
      fallbackFormatter.locale = Locale(identifier: "en_US_POSIX")
      fallbackFormatter.dateFormat = "yyyy-MM-dd"
      date = fallbackFormatter.date(from: raw)
    }

    guard let finalDate = date else { return raw }

    let formatter = DateFormatter()
    formatter.locale = Locale.current
    formatter.dateStyle = .medium
    formatter.timeStyle = .none
    return formatter.string(from: finalDate)
  }
}
`.trimStart();

const getInfoPlist = () =>
  `
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>CFBundleDevelopmentRegion</key>
  <string>$(DEVELOPMENT_LANGUAGE)</string>
  <key>CFBundleDisplayName</key>
  <string>NotificationService</string>
  <key>CFBundleExecutable</key>
  <string>$(EXECUTABLE_NAME)</string>
  <key>CFBundleIdentifier</key>
  <string>$(PRODUCT_BUNDLE_IDENTIFIER)</string>
  <key>CFBundleInfoDictionaryVersion</key>
  <string>6.0</string>
  <key>CFBundleName</key>
  <string>$(PRODUCT_NAME)</string>
  <key>CFBundlePackageType</key>
  <string>XPC!</string>
  <key>CFBundleShortVersionString</key>
  <string>1.0</string>
  <key>CFBundleVersion</key>
  <string>1</string>
  <key>NSExtension</key>
  <dict>
    <key>NSExtensionPointIdentifier</key>
    <string>com.apple.usernotifications.service</string>
    <key>NSExtensionPrincipalClass</key>
    <string>$(PRODUCT_MODULE_NAME).NotificationService</string>
  </dict>
</dict>
</plist>
`.trimStart();

const getAppTargetUuid = (project, appTargetName) => {
  const appTarget = project.pbxTargetByName(appTargetName);
  return appTarget?.uuid || null;
};

const getFileRefUuidByPathSuffix = (project, suffixPath) => {
  const fileRefs = project.hash?.project?.objects?.PBXFileReference || {};
  const normalizedSuffix = String(suffixPath).replace(/^"+|"+$/g, "");
  for (const [uuid, ref] of Object.entries(fileRefs)) {
    if (!ref || uuid.endsWith("_comment")) continue;
    const pathValue = String(ref.path || "").replace(/^"+|"+$/g, "");
    if (
      pathValue === normalizedSuffix ||
      pathValue.endsWith(`/${normalizedSuffix}`)
    ) {
      return uuid;
    }
  }
  return null;
};

const removeBuildFilesFromTargetPhaseByFileRef = (
  project,
  targetUuid,
  phaseIsa,
  fileRefUuid,
) => {
  if (!targetUuid || !fileRefUuid) return;
  const objects = project.hash?.project?.objects;
  if (!objects?.PBXNativeTarget || !objects?.PBXBuildFile) return;

  const target = objects.PBXNativeTarget[targetUuid];
  if (!target?.buildPhases) return;

  const phaseEntries = target.buildPhases
    .map((entry) => (typeof entry === "string" ? entry : entry.value))
    .filter(Boolean)
    .map((entry) => String(entry).replace(/^"+|"+$/g, ""));

  for (const phaseUuid of phaseEntries) {
    const phase = objects[phaseIsa]?.[phaseUuid];
    if (!phase?.files) continue;

    phase.files = phase.files.filter((entry) => {
      const buildFileUuid = String(
        (typeof entry === "string" ? entry : entry?.value) || "",
      ).replace(/^"+|"+$/g, "");
      if (!buildFileUuid) return false;
      const buildFile = objects.PBXBuildFile[buildFileUuid];
      return buildFile?.fileRef !== fileRefUuid;
    });
  }

  for (const [buildFileUuid, buildFile] of Object.entries(
    objects.PBXBuildFile,
  )) {
    if (!buildFile || buildFileUuid.endsWith("_comment")) continue;
    if (buildFile.fileRef === fileRefUuid) {
      const isInAnyPhase = phaseEntries.some((phaseUuid) => {
        const phase = objects[phaseIsa]?.[phaseUuid];
        return (phase?.files || []).some((entry) => {
          const uuid = String(
            (typeof entry === "string" ? entry : entry?.value) || "",
          ).replace(/^"+|"+$/g, "");
          return uuid === buildFileUuid;
        });
      });

      if (!isInAnyPhase) {
        delete objects.PBXBuildFile[buildFileUuid];
        delete objects.PBXBuildFile[`${buildFileUuid}_comment`];
      }
    }
  }
};

const ensureBuildPhaseOnTarget = (project, targetUuid, phaseIsa, phaseName) => {
  const objects = project.hash?.project?.objects;
  if (!objects?.PBXNativeTarget) return null;
  const target = objects.PBXNativeTarget[targetUuid];
  if (!target) return null;

  target.buildPhases = target.buildPhases || [];
  const phaseUuids = target.buildPhases
    .map((entry) => (typeof entry === "string" ? entry : entry.value))
    .filter(Boolean)
    .map((entry) => String(entry).replace(/^"+|"+$/g, ""));

  for (const phaseUuid of phaseUuids) {
    const phase = objects[phaseIsa]?.[phaseUuid];
    if (phase) return phaseUuid;
  }

  const uuid = project.generateUuid();
  objects[phaseIsa] = objects[phaseIsa] || {};
  objects[phaseIsa][uuid] = {
    isa: phaseIsa,
    buildActionMask: 2147483647,
    files: [],
    runOnlyForDeploymentPostprocessing: 0,
  };
  objects[phaseIsa][`${uuid}_comment`] = phaseName;

  target.buildPhases.push({
    value: uuid,
    comment: phaseName,
  });

  return uuid;
};

const ensureFileInBuildPhase = (
  project,
  phaseIsa,
  phaseUuid,
  fileRefUuid,
  comment,
) => {
  if (!phaseUuid || !fileRefUuid) return;
  const objects = project.hash?.project?.objects;
  if (!objects?.PBXBuildFile || !objects?.[phaseIsa]?.[phaseUuid]) return;

  const phase = objects[phaseIsa][phaseUuid];
  phase.files = phase.files || [];
  const exists = phase.files.some((entry) => {
    const buildFileUuid = String(
      (typeof entry === "string" ? entry : entry?.value) || "",
    ).replace(/^"+|"+$/g, "");
    const bf = objects.PBXBuildFile[buildFileUuid];
    return bf?.fileRef === fileRefUuid;
  });
  if (exists) return;

  const buildFileUuid = project.generateUuid();
  objects.PBXBuildFile[buildFileUuid] = {
    isa: "PBXBuildFile",
    fileRef: fileRefUuid,
  };
  objects.PBXBuildFile[`${buildFileUuid}_comment`] = comment;
  phase.files.push({ value: buildFileUuid, comment });
};

const sanitizePbxproj = (project) => {
  const objects = project.hash?.project?.objects;
  if (!objects) return;

  const stripUndefinedValues = (record) => {
    if (!record || typeof record !== "object") return;
    for (const key of Object.keys(record)) {
      if (record[key] === undefined) {
        delete record[key];
      }
    }
  };

  const quoteCommaBuildSetting = (record, key) => {
    if (!record || typeof record !== "object") return;
    const bs = record.buildSettings;
    if (!bs || typeof bs !== "object") return;
    const value = bs[key];
    if (typeof value !== "string") return;
    const trimmed = value.trim();
    if (trimmed.includes(",") && !/^".*"$/.test(trimmed)) {
      bs[key] = `"${trimmed}"`;
    }
  };

  for (const sectionName of Object.keys(objects)) {
    const section = objects[sectionName];
    if (!section || typeof section !== "object") continue;
    for (const [uuid, record] of Object.entries(section)) {
      if (uuid.endsWith("_comment")) continue;
      stripUndefinedValues(record);
      quoteCommaBuildSetting(record, "TARGETED_DEVICE_FAMILY");
    }
  }

  const projectSection = objects.PBXProject || {};
  for (const [uuid, record] of Object.entries(projectSection)) {
    if (!record || uuid.endsWith("_comment")) continue;
    const attrs = record.attributes;
    if (attrs?.TargetAttributes?.undefined) {
      delete attrs.TargetAttributes.undefined;
    }
  }
};

const withNotificationServiceFiles = (config) =>
  withDangerousMod(config, [
    "ios",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const iosRoot = config.modRequest.platformProjectRoot;

      const extensionRoot = path.join(iosRoot, IOS_TARGET_NAME);
      ensureDir(extensionRoot);

      fs.writeFileSync(
        path.join(extensionRoot, "NotificationService.swift"),
        getSwiftSource(),
        "utf8",
      );
      fs.writeFileSync(
        path.join(extensionRoot, `${IOS_TARGET_NAME}-Info.plist`),
        getInfoPlist(),
        "utf8",
      );

      const en = readLocaleJson(projectRoot, "en");
      if (!en) {
        throw new Error(
          "[withNotificationServiceLocalization] Missing locales/en.json",
        );
      }

      const localeFiles = fs
        .readdirSync(path.join(projectRoot, "locales"))
        .filter((name) => name.endsWith(".json"));

      for (const localeFile of localeFiles) {
        const localeCode = localeFile.replace(/\.json$/, "");
        const localeJson = readLocaleJson(projectRoot, localeCode);
        if (!localeJson) continue;

        const entries = collectNotificationEntries(localeJson, en);
        const content = toLocalizableStrings(entries);

        const iOSLocaleCode = normalizeLocaleForIOS(localeCode);
        const lprojDir = path.join(extensionRoot, `${iOSLocaleCode}.lproj`);
        ensureDir(lprojDir);
        fs.writeFileSync(
          path.join(lprojDir, "Localizable.strings"),
          content,
          "utf8",
        );

        // Keep compatibility for existing "gr" locale key in RN i18n files.
        if (localeCode === "gr") {
          const legacyDir = path.join(extensionRoot, "gr.lproj");
          ensureDir(legacyDir);
          fs.writeFileSync(
            path.join(legacyDir, "Localizable.strings"),
            content,
            "utf8",
          );
        }
      }

      return config;
    },
  ]);

const withNotificationServiceTarget = (config) =>
  withXcodeProject(config, (config) => {
    const project = config.modResults;
    const appTargetName = config.modRequest.projectName;
    const appTargetUuid = getAppTargetUuid(project, appTargetName);
    const appBundleId = config.ios?.bundleIdentifier;
    const configuredSuffix = config?.extra?.notificationServiceExtensionSuffix;
    const normalizedSuffix =
      typeof configuredSuffix === "string" && configuredSuffix.trim().length > 0
        ? configuredSuffix.trim()
        : DEFAULT_EXTENSION_BUNDLE_SUFFIX;
    const extensionBundleId = appBundleId
      ? `${appBundleId}.${normalizedSuffix}`
      : `com.example.app.${normalizedSuffix}`;

    let target = project.pbxTargetByName(IOS_TARGET_NAME);

    if (!target) {
      target = project.addTarget(
        IOS_TARGET_NAME,
        "app_extension",
        IOS_TARGET_NAME,
        extensionBundleId,
      );
    }

    const targetUuid =
      target?.uuid ||
      target?.pbxNativeTarget?.uuid ||
      Object.keys(project.hash?.project?.objects?.PBXNativeTarget || {}).find(
        (uuid) =>
          !uuid.endsWith("_comment") &&
          project.hash.project.objects.PBXNativeTarget[uuid]?.name ===
            IOS_TARGET_NAME,
      );
    if (!targetUuid) {
      throw new Error(
        "[withNotificationServiceLocalization] Failed to resolve NotificationService target UUID",
      );
    }
    const sourcesPhaseUuid = ensureBuildPhaseOnTarget(
      project,
      targetUuid,
      "PBXSourcesBuildPhase",
      "Sources",
    );
    const resourcesPhaseUuid = ensureBuildPhaseOnTarget(
      project,
      targetUuid,
      "PBXResourcesBuildPhase",
      "Resources",
    );

    ensureGroupRecursively(project, IOS_TARGET_NAME);
    addBuildSourceFileToGroup({
      filepath: `${IOS_TARGET_NAME}/NotificationService.swift`,
      groupName: IOS_TARGET_NAME,
      project,
      verbose: false,
      targetUuid,
    });

    const projectRoot = config.modRequest.projectRoot;
    const localeDir = path.join(projectRoot, "locales");
    if (fs.existsSync(localeDir)) {
      for (const file of fs.readdirSync(localeDir)) {
        if (!file.endsWith(".json")) continue;
        const localeCode = file.replace(/\.json$/, "");
        const iOSLocaleCode = normalizeLocaleForIOS(localeCode);

        addResourceFileToGroup({
          filepath: `${IOS_TARGET_NAME}/${iOSLocaleCode}.lproj/Localizable.strings`,
          groupName: IOS_TARGET_NAME,
          project,
          isBuildFile: true,
          verbose: false,
          targetUuid,
        });

        if (localeCode === "gr") {
          addResourceFileToGroup({
            filepath: `${IOS_TARGET_NAME}/gr.lproj/Localizable.strings`,
            groupName: IOS_TARGET_NAME,
            project,
            isBuildFile: true,
            verbose: false,
            targetUuid,
          });
        }
      }
    }

    // Hard-enforce extension file membership in extension phases.
    const extensionSwiftRef = getFileRefUuidByPathSuffix(
      project,
      `${IOS_TARGET_NAME}/NotificationService.swift`,
    );
    if (extensionSwiftRef) {
      ensureFileInBuildPhase(
        project,
        "PBXSourcesBuildPhase",
        sourcesPhaseUuid,
        extensionSwiftRef,
        "NotificationService.swift in Sources",
      );
    }

    const extensionLocalizableRefs = [
      ...new Set([
        "en",
        "el",
        "gr",
        ...(fs.existsSync(path.join(config.modRequest.projectRoot, "locales"))
          ? fs
              .readdirSync(path.join(config.modRequest.projectRoot, "locales"))
              .filter((name) => name.endsWith(".json"))
              .map((name) => normalizeLocaleForIOS(name.replace(/\.json$/, "")))
          : []),
      ]),
    ]
      .map((locale) =>
        getFileRefUuidByPathSuffix(
          project,
          `${locale}.lproj/Localizable.strings`,
        ),
      )
      .filter(Boolean);

    for (const fileRef of extensionLocalizableRefs) {
      ensureFileInBuildPhase(
        project,
        "PBXResourcesBuildPhase",
        resourcesPhaseUuid,
        fileRef,
        "Localizable.strings in Resources",
      );
    }

    const buildConfigList = target.pbxNativeTarget.buildConfigurationList;
    const configListId = String(
      (typeof buildConfigList === "string"
        ? buildConfigList
        : buildConfigList?.value) || "",
    ).replace(/^"+|"+$/g, "");
    const configList =
      project.hash?.project?.objects?.XCConfigurationList?.[configListId];
    const buildConfigs = configList?.buildConfigurations || [];
    for (const buildConfigRef of buildConfigs) {
      const buildConfigId = String(
        (typeof buildConfigRef === "string"
          ? buildConfigRef
          : buildConfigRef?.value) || "",
      ).replace(/^"+|"+$/g, "");
      if (!buildConfigId) continue;
      const cfg =
        project.hash?.project?.objects?.XCBuildConfiguration?.[buildConfigId];
      if (!cfg) continue;
      cfg.buildSettings = cfg.buildSettings || {};
      cfg.buildSettings.INFOPLIST_FILE = `"${IOS_TARGET_NAME}/${IOS_TARGET_NAME}-Info.plist"`;
      cfg.buildSettings.PRODUCT_BUNDLE_IDENTIFIER = `"${extensionBundleId}"`;
      cfg.buildSettings.IPHONEOS_DEPLOYMENT_TARGET =
        cfg.buildSettings.IPHONEOS_DEPLOYMENT_TARGET || "13.0";
      cfg.buildSettings.SWIFT_VERSION = "5.0";
      cfg.buildSettings.APPLICATION_EXTENSION_API_ONLY = "YES";
      cfg.buildSettings.CODE_SIGN_STYLE =
        cfg.buildSettings.CODE_SIGN_STYLE || "Automatic";
      cfg.buildSettings.SKIP_INSTALL = "YES";
      cfg.buildSettings.TARGETED_DEVICE_FAMILY = '"1,2"';
      cfg.buildSettings.DEFINES_MODULE = "YES";
      cfg.buildSettings.LD_RUNPATH_SEARCH_PATHS =
        cfg.buildSettings.LD_RUNPATH_SEARCH_PATHS ||
        '"$(inherited) @executable_path/Frameworks @executable_path/../../Frameworks"';
    }

    if (config.ios?.appleTeamId) {
      project.addTargetAttribute(
        "DevelopmentTeam",
        config.ios.appleTeamId,
        targetUuid,
      );
    }

    // Ensure extension files are never linked/compiled by the main app target.
    const appHasSameSwiftRef = getFileRefUuidByPathSuffix(
      project,
      `${IOS_TARGET_NAME}/NotificationService.swift`,
    );
    removeBuildFilesFromTargetPhaseByFileRef(
      project,
      appTargetUuid,
      "PBXSourcesBuildPhase",
      appHasSameSwiftRef,
    );

    const extensionInfoRef = getFileRefUuidByPathSuffix(
      project,
      `${IOS_TARGET_NAME}/${IOS_TARGET_NAME}-Info.plist`,
    );
    removeBuildFilesFromTargetPhaseByFileRef(
      project,
      appTargetUuid,
      "PBXResourcesBuildPhase",
      extensionInfoRef,
    );

    const extensionLocalizationRefs = [
      ...new Set(
        [
          "en",
          "el",
          "gr",
          ...(fs.existsSync(path.join(config.modRequest.projectRoot, "locales"))
            ? fs
                .readdirSync(
                  path.join(config.modRequest.projectRoot, "locales"),
                )
                .filter((name) => name.endsWith(".json"))
                .map((name) =>
                  normalizeLocaleForIOS(name.replace(/\.json$/, "")),
                )
            : []),
        ].map((locale) =>
          getFileRefUuidByPathSuffix(
            project,
            `${locale}.lproj/Localizable.strings`,
          ),
        ),
      ),
    ].filter(Boolean);

    for (const ref of extensionLocalizationRefs) {
      removeBuildFilesFromTargetPhaseByFileRef(
        project,
        appTargetUuid,
        "PBXResourcesBuildPhase",
        ref,
      );
    }

    sanitizePbxproj(project);

    return config;
  });

const withNotificationServiceLocalization = (config) => {
  config = withNotificationServiceFiles(config);
  config = withNotificationServiceTarget(config);
  return config;
};

module.exports = createRunOncePlugin(
  withNotificationServiceLocalization,
  PLUGIN_NAME,
  PLUGIN_VERSION,
);
