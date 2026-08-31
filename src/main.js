
import {
  app,
  BrowserWindow,
  ipcMain
} from "electron";

import path from "node:path";
import fs from "node:fs";

import started from "electron-squirrel-startup";

import {
  updateElectronApp,
  UpdateSourceType
} from "update-electron-app";


const DEFAULT_SERVER_URL =
  "http://localhost:3000";

let serverUrl = DEFAULT_SERVER_URL;

function getServerSettingsPath() {
  return path.join(app.getPath("userData"), "server-settings.json");
}

function loadServerUrl() {
  try {
    const settings = JSON.parse(fs.readFileSync(getServerSettingsPath(), "utf8"));
    if (typeof settings.serverUrl === "string" && settings.serverUrl) {
      serverUrl = settings.serverUrl;
    }
  } catch {
    // First launch (or an unreadable settings file): use the default server.
  }
}

function normalizeServerUrl(value) {
  const url = new URL(String(value).trim());
  if (!/^https?:$/.test(url.protocol)) {
    throw new Error("Use a full HTTP or HTTPS server address.");
  }
  return url.toString().replace(/\/$/, "");
}


/*
|--------------------------------------------------------------------------
| SQUIRREL
|--------------------------------------------------------------------------
*/

if (started) {

  app.quit();

}


/*
|--------------------------------------------------------------------------
| AUTOMATIC UPDATES
|--------------------------------------------------------------------------
*/

if (!app.isPackaged) {

  console.log(
    "Automatic updates disabled while running in development mode."
  );

} else {

  console.log(
    "Automatic updates enabled."
  );

  updateElectronApp({

    updateSource: {

      type:
        UpdateSourceType.ElectronPublicUpdateService,

      repo:
        "Akira-AI-Glitch/WarehousePartLocator"

    },

    updateInterval:
      "1 minute",

    notifyUser:
      true,

    logger:
      console

  });

}


/*
|--------------------------------------------------------------------------
| SERVER REQUEST
|--------------------------------------------------------------------------
*/

async function serverRequest(
  endpoint,
  options = {}
) {

  const response =
    await fetch(
      serverUrl + endpoint,
      {
        ...options,

        headers: {
          "Content-Type":
            "application/json",

          ...(options.headers || {})
        }
      }
    );


  let data;


  try {

    data =
      await response.json();

  } catch {

    throw new Error(
      "Server returned invalid JSON. HTTP " +
      response.status
    );

  }


  if (!response.ok) {

    throw new Error(
      data.error ||
      "Server returned HTTP " +
      response.status
    );

  }


  return data;

}


/*
|--------------------------------------------------------------------------
| WINDOW
|--------------------------------------------------------------------------
*/

const createWindow = () => {

  const mainWindow =
    new BrowserWindow({

      width:
        1200,

      height:
        750,

      minWidth:
        900,

      minHeight:
        600,

      webPreferences: {

        preload:
          path.join(
            __dirname,
            "preload.js"
          ),

        contextIsolation:
          true,

        nodeIntegration:
          false

      }

    });


  if (
    MAIN_WINDOW_VITE_DEV_SERVER_URL
  ) {

    mainWindow.loadURL(
      MAIN_WINDOW_VITE_DEV_SERVER_URL
    );

  } else {

    mainWindow.loadFile(

      path.join(

        __dirname,

        "../renderer/" +
        MAIN_WINDOW_VITE_NAME +
        "/index.html"

      )

    );

  }

};


/*
|--------------------------------------------------------------------------
| APPLICATION VERSION
|--------------------------------------------------------------------------
*/

ipcMain.handle(
  "get-app-version",
  () => {

    return app.getVersion();

  }
);

ipcMain.handle("get-server-url", () => serverUrl);

ipcMain.handle("set-server-url", async (_event, value) => {
  const nextUrl = normalizeServerUrl(value);
  const previousUrl = serverUrl;
  serverUrl = nextUrl;

  try {
    await serverRequest("/");
    fs.writeFileSync(getServerSettingsPath(), JSON.stringify({ serverUrl }, null, 2));
    return serverUrl;
  } catch (error) {
    serverUrl = previousUrl;
    throw new Error(`Could not connect to ${nextUrl}: ${error.message}`);
  }
});


/*
|--------------------------------------------------------------------------
| ADD PART
|--------------------------------------------------------------------------
*/

ipcMain.handle(
  "add-part",
  async (_event, part) => {

    return await serverRequest(

      "/parts",

      {

        method:
          "POST",

        body:
          JSON.stringify({

            partNumber:
              part.partNumber ?? "",

            customerName:
              part.customerName ?? "",

            poNumber:
              part.poNumber ?? "",

            location:
              part.location ?? "",

            quantity:
              Number(part.quantity) || 0,

            notes:
              part.notes ?? ""

          })

      }

    );

  }
);


/*
|--------------------------------------------------------------------------
| GET PARTS
|--------------------------------------------------------------------------
*/

ipcMain.handle(
  "get-parts",
  async (_event, options = {}) => {

    const params =
      new URLSearchParams();


    params.set(
      "search",
      options.search ?? ""
    );


    params.set(
      "sort",
      options.sort ?? "newest"
    );


    params.set(
      "archived",
      options.archived ?? "active"
    );


    return await serverRequest(

      "/parts?" +
      params.toString(),

      {

        method:
          "GET"

      }

    );

  }
);


/*
|--------------------------------------------------------------------------
| EDIT PART
|--------------------------------------------------------------------------
*/

ipcMain.handle(
  "update-part",
  async (_event, part) => {

    if (
      !part ||
      !part.id
    ) {

      throw new Error(
        "A valid part ID is required."
      );

    }


    return await serverRequest(

      "/parts/" +
      part.id,

      {

        method:
          "PUT",

        body:
          JSON.stringify({

            partNumber:
              part.partNumber ?? "",

            customerName:
              part.customerName ?? "",

            poNumber:
              part.poNumber ?? "",

            location:
              part.location ?? "",

            quantity:
              Number(part.quantity) || 0,

            notes:
              part.notes ?? ""

          })

      }

    );

  }
);


/*
|--------------------------------------------------------------------------
| ARCHIVE
|--------------------------------------------------------------------------
*/

ipcMain.handle(
  "archive-part",
  async (_event, id) => {

    return await serverRequest(

      "/parts/" +
      id +
      "/archive",

      {

        method:
          "PATCH"

      }

    );

  }
);


/*
|--------------------------------------------------------------------------
| RESTORE
|--------------------------------------------------------------------------
*/

ipcMain.handle(
  "unarchive-part",
  async (_event, id) => {

    return await serverRequest(

      "/parts/" +
      id +
      "/restore",

      {

        method:
          "PATCH"

      }

    );

  }
);


/*
|--------------------------------------------------------------------------
| DELETE
|--------------------------------------------------------------------------
*/

ipcMain.handle(
  "delete-part",
  async (_event, id) => {

    return await serverRequest(

      "/parts/" +
      id,

      {

        method:
          "DELETE"

      }

    );

  }
);

ipcMain.handle("get-legend", () => serverRequest("/legend"));

ipcMain.handle("create-legend", (_event, entry) =>
  serverRequest("/legend", {
    method: "POST",
    body: JSON.stringify(entry)
  })
);

ipcMain.handle("update-legend", (_event, entry) =>
  serverRequest(`/legend/${entry.id}`, {
    method: "PUT",
    body: JSON.stringify(entry)
  })
);

ipcMain.handle("delete-legend", (_event, id) =>
  serverRequest(`/legend/${id}`, { method: "DELETE" })
);


/*
|--------------------------------------------------------------------------
| APPLICATION STARTUP
|--------------------------------------------------------------------------
*/

app.whenReady().then(
  async () => {

    loadServerUrl();

    try {

      const server =
        await serverRequest(
          "/"
        );


      console.log(
        "Warehouse server connected:",
        server
      );

    } catch (error) {

      console.error(
        "WAREHOUSE SERVER CONNECTION FAILED:",
        error.message
      );

    }


    createWindow();


    app.on(
      "activate",
      () => {

        if (
          BrowserWindow
            .getAllWindows()
            .length === 0
        ) {

          createWindow();

        }

      }
    );

  }
);


/*
|--------------------------------------------------------------------------
| CLOSE
|--------------------------------------------------------------------------
*/

app.on(
  "window-all-closed",
  () => {

    if (
      process.platform !== "darwin"
    ) {

      app.quit();

    }

  }
);
