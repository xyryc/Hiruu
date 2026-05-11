#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const projectRoot = process.cwd();
const podfilePath = path.join(projectRoot, "ios", "Podfile");
const stripeInteropHeaderPath = path.join(
  projectRoot,
  "node_modules",
  "@stripe",
  "stripe-react-native",
  "ios",
  "StripeSwiftInterop.h",
);

const run = (cmd, cwd = projectRoot) => {
  console.log(`\n$ ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd });
};

const applyPodfileFixes = () => {
  if (!fs.existsSync(podfilePath)) {
    console.error(
      "Podfile not found at ios/Podfile. Run `npx expo prebuild --platform ios` first.",
    );
    process.exit(1);
  }

  let content = fs.readFileSync(podfilePath, "utf8");
  let changed = false;

  const staticFrameworkFlagLine = "$RNFirebaseAsStaticFramework = true";
  if (!content.includes(staticFrameworkFlagLine)) {
    const anchorRegex =
      /(podfile_properties\s*=\s*JSON\.parse\([^\n]*\)\s*rescue\s*\{\}\n)/;
    if (!anchorRegex.test(content)) {
      console.error(
        "Could not find podfile_properties line to insert RNFirebase static framework flag.",
      );
      process.exit(1);
    }
    content = content.replace(anchorRegex, `$1${staticFrameworkFlagLine}\n`);
    changed = true;
  }

  const forcedUseFrameworksLine = "  use_frameworks! :linkage => :static";
  const oldConditionalUseFrameworksRegex =
    /\n\s*use_frameworks!\s*:linkage\s*=>\s*podfile_properties\['ios\.useFrameworks'\]\.to_sym\s*if\s*podfile_properties\['ios\.useFrameworks'\]\s*\n\s*use_frameworks!\s*:linkage\s*=>\s*ENV\['USE_FRAMEWORKS'\]\.to_sym\s*if\s*ENV\['USE_FRAMEWORKS'\]\s*/m;

  if (oldConditionalUseFrameworksRegex.test(content)) {
    content = content.replace(
      oldConditionalUseFrameworksRegex,
      `\n${forcedUseFrameworksLine}\n`,
    );
    changed = true;
  } else if (!content.includes(forcedUseFrameworksLine)) {
    const nativeModulesAnchor =
      /(config\s*=\s*use_native_modules!\(config_command\)\n)/;
    if (!nativeModulesAnchor.test(content)) {
      console.error(
        "Could not find native modules config line to insert static use_frameworks.",
      );
      process.exit(1);
    }
    content = content.replace(
      nativeModulesAnchor,
      `$1\n${forcedUseFrameworksLine}\n`,
    );
    changed = true;
  }

  content = content.replace(
    /(\n\s*use_frameworks!\s*:linkage\s*=>\s*:static)\s*use_react_native!\s*\(/m,
    `$1\n\n  use_react_native!(`,
  );

  const lines = content.split("\n");
  const postStart = lines.findIndex((line) =>
    line.includes("post_install do |installer|"),
  );
  if (postStart === -1) {
    console.error(
      "Could not find `post_install do |installer|` block in ios/Podfile.",
    );
    process.exit(1);
  }

  let depth = 1;
  let postEnd = -1;
  for (let i = postStart + 1; i < lines.length; i += 1) {
    const line = lines[i];
    const doCount = (line.match(/\bdo\b/g) || []).length;
    const endCount = (line.match(/\bend\b/g) || []).length;
    depth += doCount - endCount;
    if (depth === 0) {
      postEnd = i;
      break;
    }
  }

  if (postEnd === -1) {
    console.error("Could not determine the end of post_install block.");
    process.exit(1);
  }

  const postBlock = lines.slice(postStart, postEnd + 1).join("\n");
  const rnfbBlockRegex =
    /\n\s*# BEGIN HIRUU RNFB WORKAROUND[\s\S]*?# END HIRUU RNFB WORKAROUND\n?/m;
  let updatedPostBlock = postBlock;

  if (rnfbBlockRegex.test(updatedPostBlock)) {
    updatedPostBlock = updatedPostBlock.replace(rnfbBlockRegex, "\n");
  }

  const patchBlock = [
    "",
    "    # BEGIN HIRUU RNFB WORKAROUND",
    "    installer.pods_project.targets.each do |target|",
    "      next unless target.name.start_with?('RNFB')",
    "",
    "      target.build_configurations.each do |config|",
    "        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
    "        config.build_settings['CLANG_ENABLE_MODULES'] = 'NO'",
    "        config.build_settings['DEFINES_MODULE'] = 'NO'",
    "",
    "        if target.name == 'RNFBApp'",
    "          config.build_settings['OTHER_CFLAGS'] = '$(inherited) -Wno-error=non-modular-include-in-framework-module'",
    "        end",
    "      end",
    "    end",
    "    # END HIRUU RNFB WORKAROUND",
  ].join("\n");

  if (
    !updatedPostBlock.includes("next unless target.name.start_with?('RNFB')")
  ) {
    updatedPostBlock = updatedPostBlock.replace(
      /\n\s*end\s*$/,
      `${patchBlock}\n  end`,
    );
  }

  if (updatedPostBlock !== postBlock) {
    const nextLines = content.split("\n");
    nextLines.splice(
      postStart,
      postEnd - postStart + 1,
      ...updatedPostBlock.split("\n"),
    );
    content = nextLines.join("\n");
    changed = true;
  }

  if (changed) {
    fs.writeFileSync(podfilePath, content, "utf8");
    console.log("Applied iOS Podfile fixes successfully.");
  } else {
    console.log("Podfile already contains required fixes. No changes made.");
  }
};

const applyStripeInteropFix = () => {
  if (!fs.existsSync(stripeInteropHeaderPath)) {
    console.warn("Stripe interop header not found. Skipping Stripe enum fix.");
    return;
  }

  const content = fs.readFileSync(stripeInteropHeaderPath, "utf8");
  const fromLine = "typedef NS_ENUM(NSUInteger, STPPaymentStatus);";
  const toLine = "typedef NS_ENUM(NSInteger, STPPaymentStatus);";

  if (!content.includes(fromLine)) {
    if (content.includes(toLine)) {
      console.log("Stripe interop enum fix already applied.");
      return;
    }
    console.warn(
      "Stripe interop enum line not found. Skipping Stripe enum fix.",
    );
    return;
  }

  const updated = content.replace(fromLine, toLine);
  fs.writeFileSync(stripeInteropHeaderPath, updated, "utf8");
  console.log("Applied Stripe interop enum fix successfully.");
};

const runFullPodFix = () => {
  applyStripeInteropFix();
  applyPodfileFixes();
  run("rm -rf Pods Podfile.lock", path.join(projectRoot, "ios"));
  run("pod install --repo-update", path.join(projectRoot, "ios"));
  run("rm -rf ~/Library/Developer/Xcode/DerivedData");
  // run("open ios/Hiruu.xcworkspace");
};

runFullPodFix();
