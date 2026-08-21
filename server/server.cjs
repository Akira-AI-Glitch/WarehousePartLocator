const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const Database = require("better-sqlite3");

const HOST = "0.0.0.0";
const PORT = 3000;

/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

const appData =
  process.env.APPDATA ||
  path.join(os.homedir(), "AppData", "Roaming");

const databaseDirectory =
  path.join(
    appData,
    "warehousepartlocator"
  );

fs.mkdirSync(
  databaseDirectory,
  {
    recursive: true
  }
);

const databasePath =
  path.join(
    databaseDirectory,
    "inventory.db"
  );

const db =
  new Database(databasePath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS parts (
    id INTEGER PRIMARY KEY AUTOINCREMENT,

    partNumber TEXT NOT NULL DEFAULT '',

    customerName TEXT NOT NULL DEFAULT '',

    poNumber TEXT NOT NULL DEFAULT '',

    location TEXT NOT NULL DEFAULT '',

    quantity INTEGER NOT NULL DEFAULT 0,

    notes TEXT NOT NULL DEFAULT '',

    archived INTEGER NOT NULL DEFAULT 0,

    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);

console.log("");
console.log("==========================================");
console.log(" Warehouse Part Locator Server");
console.log("==========================================");
console.log("");
console.log("Database:");
console.log(databasePath);
console.log("");
console.log("Server:");
console.log(`http://localhost:${PORT}`);
console.log("");
console.log("Network:");
console.log(`http://10.13.1.135:${PORT}`);
console.log("");
console.log("Listening for warehouse computers...");
console.log("");

/*
|--------------------------------------------------------------------------
| SEND JSON
|--------------------------------------------------------------------------
*/

function sendJSON(
  res,
  statusCode,
  data
) {

  const body =
    JSON.stringify(data);

  res.writeHead(
    statusCode,
    {
      "Content-Type":
        "application/json",

      "Access-Control-Allow-Origin":
        "*",

      "Access-Control-Allow-Methods":
        "GET,POST,PUT,PATCH,DELETE,OPTIONS",

      "Access-Control-Allow-Headers":
        "Content-Type"
    }
  );

  res.end(body);
}


/*
|--------------------------------------------------------------------------
| ERROR
|--------------------------------------------------------------------------
*/

function sendError(
  res,
  statusCode,
  message
) {

  sendJSON(
    res,
    statusCode,
    {
      success: false,
      error: message
    }
  );

}


/*
|--------------------------------------------------------------------------
| READ REQUEST BODY
|--------------------------------------------------------------------------
*/

function readBody(req) {

  return new Promise(
    (resolve, reject) => {

      let body = "";

      req.on(
        "data",
        chunk => {

          body += chunk;

          if (
            body.length >
            1024 * 1024
          ) {

            reject(
              new Error(
                "Request body is too large."
              )
            );

            req.destroy();

          }

        }
      );

      req.on(
        "end",
        () => {

          if (!body) {

            resolve({});

            return;

          }

          try {

            resolve(
              JSON.parse(body)
            );

          } catch {

            reject(
              new Error(
                "Invalid JSON."
              )
            );

          }

        }
      );

      req.on(
        "error",
        reject
      );

    }
  );

}


/*
|--------------------------------------------------------------------------
| GET PARTS
|--------------------------------------------------------------------------
*/

function getParts(query) {

  const search =
    String(
      query.search || ""
    ).trim();

  const sort =
    query.sort || "newest";

  const archived =
    query.archived || "active";

  const searchValue =
    `%${search}%`;

  let archivedSQL =
    "archived = 0";

  if (
    archived === "archived"
  ) {

    archivedSQL =
      "archived = 1";

  }

  if (
    archived === "all"
  ) {

    archivedSQL =
      "1 = 1";

  }

  let orderSQL =
    "createdAt DESC";

  switch (sort) {

    case "oldest":

      orderSQL =
        "createdAt ASC";

      break;

    case "partAsc":

      orderSQL =
        "partNumber COLLATE NOCASE ASC";

      break;

    case "partDesc":

      orderSQL =
        "partNumber COLLATE NOCASE DESC";

      break;

    case "nameAsc":

      orderSQL =
        "customerName COLLATE NOCASE ASC";

      break;

    case "nameDesc":

      orderSQL =
        "customerName COLLATE NOCASE DESC";

      break;

    case "locationAsc":

      orderSQL =
        "location COLLATE NOCASE ASC";

      break;

    case "locationDesc":

      orderSQL =
        "location COLLATE NOCASE DESC";

      break;

    case "quantityAsc":

      orderSQL =
        "quantity ASC";

      break;

    case "quantityDesc":

      orderSQL =
        "quantity DESC";

      break;

    case "newest":

    default:

      orderSQL =
        "createdAt DESC";

      break;

  }

  const statement =
    db.prepare(`

      SELECT
        id,
        partNumber,
        customerName,
        poNumber,
        location,
        quantity,
        notes,
        archived,
        createdAt

      FROM parts

      WHERE

        ${archivedSQL}

        AND (

          partNumber LIKE ?

          OR customerName LIKE ?

          OR poNumber LIKE ?

          OR location LIKE ?

          OR notes LIKE ?

        )

      ORDER BY ${orderSQL}

    `);

  return statement.all(

    searchValue,
    searchValue,
    searchValue,
    searchValue,
    searchValue

  );

}


/*
|--------------------------------------------------------------------------
| HTTP SERVER
|--------------------------------------------------------------------------
*/

const server =
  http.createServer(
    async (req, res) => {

      try {

        /*
        |--------------------------------------------------------------------------
        | OPTIONS
        |--------------------------------------------------------------------------
        */

        if (
          req.method === "OPTIONS"
        ) {

          res.writeHead(
            204,
            {
              "Access-Control-Allow-Origin":
                "*",

              "Access-Control-Allow-Methods":
                "GET,POST,PUT,PATCH,DELETE,OPTIONS",

              "Access-Control-Allow-Headers":
                "Content-Type"
            }
          );

          res.end();

          return;

        }


        const url =
          new URL(
            req.url,
            `http://${req.headers.host}`
          );

        const pathname =
          url.pathname;


        /*
        |--------------------------------------------------------------------------
        | SERVER TEST
        |--------------------------------------------------------------------------
        */

        if (
          req.method === "GET" &&
          pathname === "/"
        ) {

          sendJSON(
            res,
            200,
            {
              success: true,

              application:
                "Warehouse Part Locator",

              server:
                "online"
            }
          );

          return;

        }


        /*
        |--------------------------------------------------------------------------
        | GET PARTS
        |--------------------------------------------------------------------------
        */

        if (
          req.method === "GET" &&
          pathname === "/parts"
        ) {

          const parts =
            getParts(
              Object.fromEntries(
                url.searchParams
              )
            );

          sendJSON(
            res,
            200,
            parts
          );

          return;

        }


        /*
        |--------------------------------------------------------------------------
        | ADD PART
        |--------------------------------------------------------------------------
        */

        if (
          req.method === "POST" &&
          pathname === "/parts"
        ) {

          const part =
            await readBody(req);

          const statement =
            db.prepare(`

              INSERT INTO parts (
                partNumber,
                customerName,
                poNumber,
                location,
                quantity,
                notes
              )

              VALUES (?, ?, ?, ?, ?, ?)

            `);

          const result =
            statement.run(

              part.partNumber ?? "",

              part.customerName ?? "",

              part.poNumber ?? "",

              part.location ?? "",

              Number(part.quantity) || 0,

              part.notes ?? ""

            );

          sendJSON(
            res,
            200,
            {
              success: true,

              id:
                result.lastInsertRowid
            }
          );

          return;

        }


        /*
        |--------------------------------------------------------------------------
        | PART ID ROUTES
        |--------------------------------------------------------------------------
        */

        const match =
          pathname.match(
            /^\/parts\/(\d+)(?:\/(archive|restore))?$/
          );

        if (match) {

          const id =
            Number(match[1]);

          const action =
            match[2];


          /*
          |--------------------------------------------------------------------------
          | ARCHIVE
          |--------------------------------------------------------------------------
          */

          if (
            req.method === "PATCH" &&
            action === "archive"
          ) {

            const result =
              db.prepare(`

                UPDATE parts

                SET archived = 1

                WHERE id = ?

              `).run(id);

            sendJSON(
              res,
              200,
              {
                success:
                  result.changes > 0
              }
            );

            return;

          }


          /*
          |--------------------------------------------------------------------------
          | RESTORE
          |--------------------------------------------------------------------------
          */

          if (
            req.method === "PATCH" &&
            action === "restore"
          ) {

            const result =
              db.prepare(`

                UPDATE parts

                SET archived = 0

                WHERE id = ?

              `).run(id);

            sendJSON(
              res,
              200,
              {
                success:
                  result.changes > 0
              }
            );

            return;

          }


          /*
          |--------------------------------------------------------------------------
          | DELETE
          |--------------------------------------------------------------------------
          */

          if (
            req.method === "DELETE" &&
            !action
          ) {

            const result =
              db.prepare(`

                DELETE FROM parts

                WHERE id = ?

              `).run(id);

            sendJSON(
              res,
              200,
              {
                success:
                  result.changes > 0
              }
            );

            return;

          }


          /*
          |--------------------------------------------------------------------------
          | UPDATE
          |--------------------------------------------------------------------------
          */

          if (
            req.method === "PUT" &&
            !action
          ) {

            const part =
              await readBody(req);

            const result =
              db.prepare(`

                UPDATE parts

                SET
                  partNumber = ?,
                  customerName = ?,
                  poNumber = ?,
                  location = ?,
                  quantity = ?,
                  notes = ?

                WHERE id = ?

              `).run(

                part.partNumber ?? "",

                part.customerName ?? "",

                part.poNumber ?? "",

                part.location ?? "",

                Number(part.quantity) || 0,

                part.notes ?? "",

                id

              );

            sendJSON(
              res,
              200,
              {
                success:
                  result.changes > 0
              }
            );

            return;

          }

        }


        /*
        |--------------------------------------------------------------------------
        | NOT FOUND
        |--------------------------------------------------------------------------
        */

        sendError(
          res,
          404,
          "Not found."
        );

      } catch (error) {

        console.error(
          "SERVER ERROR:",
          error
        );

        sendError(
          res,
          500,
          error.message ||
            "Internal server error."
        );

      }

    }
  );


/*
|--------------------------------------------------------------------------
| START SERVER
|--------------------------------------------------------------------------
*/

server.listen(
  PORT,
  HOST,
  () => {

    console.log(
      `Server listening on port ${PORT}`
    );

  }
);


/*
|--------------------------------------------------------------------------
| SHUTDOWN
|--------------------------------------------------------------------------
*/

process.on(
  "SIGINT",
  () => {

    console.log(
      "\nShutting down..."
    );

    db.close();

    server.close(
      () => {

        process.exit(0);

      }
    );

  }
);