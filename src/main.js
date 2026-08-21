import {
  app,
  BrowserWindow,
  ipcMain
} from "electron";

import path from "node:path";

import started from "electron-squirrel-startup";

const SERVER_URL = "http://10.13.1.135:3000";


/*
|--------------------------------------------------------------------------
| Squirrel
|--------------------------------------------------------------------------
*/

if (started) {
  app.quit();
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
  const response = await fetch(
    `${SERVER_URL}${endpoint}`,
    {
      ...options,

      headers: {
        "Content-Type": "application/json",
        ...(options.headers || {})
      }
    }
  );

  let data;

  try {
    data = await response.json();
  } catch {
    throw new Error(
      `Server returned invalid JSON. HTTP ${response.status}`
    );
  }

  if (!response.ok) {
    throw new Error(
      data.error ||
      `Server returned HTTP ${response.status}`
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

      width: 1200,

      height: 750,

      minWidth: 900,

      minHeight: 600,

      webPreferences: {

        preload: path.join(
          __dirname,
          "preload.js"
        ),

        contextIsolation: true,

        nodeIntegration: false

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

        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`

      )

    );

  }

};


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
        method: "POST",

        body: JSON.stringify({
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
      `/parts?${params.toString()}`,
      {
        method: "GET"
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
      `/parts/${part.id}`,
      {
        method: "PUT",

        body: JSON.stringify({
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
      `/parts/${id}/archive`,
      {
        method: "PATCH"
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
      `/parts/${id}/restore`,
      {
        method: "PATCH"
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
      `/parts/${id}`,
      {
        method: "DELETE"
      }
    );

  }
);


/*
|--------------------------------------------------------------------------
| APPLICATION STARTUP
|--------------------------------------------------------------------------
*/

app.whenReady().then(
  async () => {

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