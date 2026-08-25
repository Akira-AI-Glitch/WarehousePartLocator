This is a WareHouse Locator used to help inventory and show locations of anything you need


This program was made by the help of AI and a lot of sleepless nights.

Warehouse Part Locator — Cheat Sheet
1. Start the Warehouse Server
Open PowerShell:
cd C:\Users\Ops\WarehousePartLocator
node server/server.cjs
Leave this PowerShell window open!
You know it works when you see,
Warehouse Part Locator Server
Server listening on port 3000
Listening for warehouse computers...
________________________________________
2. Run the App for Development
cd C:\Users\Ops\WarehousePartLocator
npm start
This starts the app in development mode.
________________________________________
3. Publish a New Update
After you make changes to the application and test them:
cd C:\Users\Ops\WarehousePartLocator
node publish-update.js
________________________________________
QUICK REFERENCE
What you want	Command
Start server	node server/server.cjs
Run app	npm start
Publish update	node publish-update.js
Build only	npm run make
Check version	Get-Content .\package.json
Most important two commands
Start server:
node server/server.cjs
Publish update:
node publish-update.js
Keep the server PowerShell window open whenever the warehouse computers need access to the database/server.

