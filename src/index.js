const { app, BrowserWindow, Menu } = require("electron");
const isDev = require("electron-is-dev");
const path = require("path");

app.allowRendererProcessReuse = false;

const menuTemplate = [
  {
    label: "Evelyn",
    submenu: [{ label: "Quit", role: "quit" }],
  },
];
if (isDev)
  menuTemplate.unshift(
    { label: "DevTools", role: "toggleDevTools" },
    { label: "Reload", role: "reload" }
  );

global.sharedData = { userId: null };

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
    },
  });
  mainWindow.loadFile(path.join(__dirname, "pages/login.html"));
};

app.on("ready", () => {
  Menu.setApplicationMenu(Menu.buildFromTemplate(menuTemplate));
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
