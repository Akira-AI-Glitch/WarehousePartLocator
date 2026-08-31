const {
  contextBridge,
  ipcRenderer
} = require("electron");


contextBridge.exposeInMainWorld(
  "api",
  {

    /*
    |--------------------------------------------------------------------------
    | APPLICATION VERSION
    |--------------------------------------------------------------------------
    */

    getAppVersion: () =>
      ipcRenderer.invoke(
        "get-app-version"
      ),

    getServerUrl: () => ipcRenderer.invoke("get-server-url"),

    setServerUrl: (url) => ipcRenderer.invoke("set-server-url", url),


    /*
    |--------------------------------------------------------------------------
    | INVENTORY
    |--------------------------------------------------------------------------
    */

    addPart: (part) =>
      ipcRenderer.invoke(
        "add-part",
        part
      ),


    getParts: (options) =>
      ipcRenderer.invoke(
        "get-parts",
        options
      ),


    updatePart: (part) =>
      ipcRenderer.invoke(
        "update-part",
        part
      ),


    archivePart: (id) =>
      ipcRenderer.invoke(
        "archive-part",
        id
      ),


    unarchivePart: (id) =>
      ipcRenderer.invoke(
        "unarchive-part",
        id
      ),


    deletePart: (id) =>
      ipcRenderer.invoke(
        "delete-part",
        id
      ),

    getLegend: () => ipcRenderer.invoke("get-legend"),

    createLegend: (entry) => ipcRenderer.invoke("create-legend", entry),

    updateLegend: (entry) => ipcRenderer.invoke("update-legend", entry),

    deleteLegend: (id) => ipcRenderer.invoke("delete-legend", id)

  }
);
