module.exports = {
  packagerConfig: {
    asar: true,

    ignore: [
      /node_modules\/(?!(better-sqlite3)\/)/
    ]
  },

  rebuildConfig: {
    force: true
  },

  makers: [
    {
      name: "@electron-forge/maker-squirrel",
      config: {
        name: "warehousepartlocator",
        authors: "Kayne W Acton",
        description: "Warehouse Part Locator"
      }
    },

    {
      name: "@electron-forge/maker-zip",
      platforms: ["win32"]
    }
  ],

  publishers: [
    {
      name: "@electron-forge/publisher-github",
      config: {
        repository: {
          owner: "Akira-AI-Glitch",
          name: "WarehousePartLocator"
        },
        draft: true
      }
    }
  ],

  plugins: [
    {
      name: "@electron-forge/plugin-vite",

      config: {
        build: [
          {
            entry: "src/main.js",
            config: "vite.main.config.mjs"
          },
          {
            entry: "src/preload.js",
            config: "vite.preload.config.mjs"
          }
        ],

        renderer: [
          {
            name: "main_window",
            config: "vite.renderer.config.mjs"
          }
        ]
      }
    },

    {
      name: "@electron-forge/plugin-auto-unpack-natives",
      config: {}
    }
  ]
};