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
    oneClick: true,
    perMachine: false,
    allowToChangeInstallationDirectory: false,
    deleteAppDataOnUninstall: false,
    allowElevation: true,
    createDesktopShortcut: true,
    createStartMenuShortcut: true,
    runAfterFinish: true
  },
  compression: "normal",
  buildVersion: "1.0.0",
  artifactBuildCompleted: null,
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