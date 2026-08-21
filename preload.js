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
      )

  }
);