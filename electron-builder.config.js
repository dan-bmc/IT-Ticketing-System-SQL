module.exports = {
  appId: "com.shahidan.it-app",
  asar: true,
  directories: {
    output: "Installer"
  },
  publish: [{
     provider: "github",
     owner: "dan-bmc",
     repo: "IT-Ticketing-System-SQL"
  }],
  win: {
    target: [{
      target: "nsis",
      arch: ["x64"]
    }],
    artifactName: "IT-Help-Desk-Setup-${version}.${ext}",
    publisherName: "IT Help Desk"
  },
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false
  },
  compression: "normal",
  buildVersion: "1.0.0",
  // Skip unpacked directory to save space
  artifactBuildCompleted: null,
  removePackageScripts: true,
  npmRebuild: false,
  nsis: {
    oneClick: false,
    perMachine: false,
    allowToChangeInstallationDirectory: true,
    deleteAppDataOnUninstall: false
  },
  removePackageScripts: true,
  npmRebuild: false,
  files: [
    "src/**/*",
    "package.json",
    "main.js",
    "preload.js"
  ],
  extraResources: [],
  asarUnpack: [],
  forceCodeSigning: false
}