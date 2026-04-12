#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const projectRoot = process.cwd();
const podfilePath = path.join(projectRoot, 'ios', 'Podfile');

if (!fs.existsSync(podfilePath)) {
  console.error('Podfile not found at ios/Podfile. Run `npx expo prebuild --platform ios` first.');
  process.exit(1);
}

let content = fs.readFileSync(podfilePath, 'utf8');
let changed = false;

const staticFrameworkLine = '$RNFirebaseAsStaticFramework = true';
if (!content.includes(staticFrameworkLine)) {
  const anchorRegex = /(podfile_properties\s*=\s*JSON\.parse\([^\n]*\)\s*rescue\s*\{\}\n)/;
  if (!anchorRegex.test(content)) {
    console.error('Could not find podfile_properties line to insert RNFirebase static framework flag.');
    process.exit(1);
  }
  content = content.replace(anchorRegex, `$1${staticFrameworkLine}\n`);
  changed = true;
}

const lines = content.split('\n');
const postStart = lines.findIndex((line) => line.includes('post_install do |installer|'));
if (postStart === -1) {
  console.error('Could not find `post_install do |installer|` block in ios/Podfile.');
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
  console.error('Could not determine the end of post_install block.');
  process.exit(1);
}

const postBlock = lines.slice(postStart, postEnd + 1).join('\n');
const hasRnfbPatch = postBlock.includes('rnfb_targets = %w[RNFBApp RNFBAuth RNFBMessaging]');

if (!hasRnfbPatch) {
  const patchBlock = [
    '',
    '    # BEGIN HIRUU RNFB WORKAROUND',
    '    rnfb_targets = %w[RNFBApp RNFBAuth RNFBMessaging]',
    '    installer.pods_project.targets.each do |target|',
    '      next unless rnfb_targets.include?(target.name)',
    '',
    '      target.build_configurations.each do |config|',
    "        config.build_settings['CLANG_ALLOW_NON_MODULAR_INCLUDES_IN_FRAMEWORK_MODULES'] = 'YES'",
    "        if target.name == 'RNFBApp'",
    "          config.build_settings['OTHER_CFLAGS'] = '$(inherited) -Wno-error=non-modular-include-in-framework-module'",
    '        end',
    "        if target.name == 'RNFBMessaging'",
    "          config.build_settings['CLANG_ENABLE_MODULES'] = 'NO'",
    "          config.build_settings['DEFINES_MODULE'] = 'NO'",
    '        end',
    '      end',
    '    end',
    '    # END HIRUU RNFB WORKAROUND',
  ];

  lines.splice(postEnd, 0, ...patchBlock);
  content = lines.join('\n');
  changed = true;
}

if (changed) {
  fs.writeFileSync(podfilePath, content, 'utf8');
  console.log('Applied iOS Podfile fixes successfully.');
} else {
  console.log('Podfile already contains required fixes. No changes made.');
}
