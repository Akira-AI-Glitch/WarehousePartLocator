const http = require("http");
const fs = require("fs");
const path = require("path");
const os = require("os");
const Database = require("better-sqlite3");

const PORT = 3000;
const SERVER_HOSTNAME = "localhost";


/*
|--------------------------------------------------------------------------
| DATABASE
|--------------------------------------------------------------------------
*/

const appData =
  process.env.APPDATA ||
  path.join(
    os.homedir(),
    "AppData",
    "Roaming"
  );

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


/*
|--------------------------------------------------------------------------
| PARTS TABLE
|--------------------------------------------------------------------------
*/

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


/*
|--------------------------------------------------------------------------
| LEGEND TABLE
|--------------------------------------------------------------------------
*/

db.exec(`
  CREATE TABLE IF NOT EXISTS legend (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    abbreviation TEXT NOT NULL DEFAULT '',
    meaning TEXT NOT NULL DEFAULT '',
    description TEXT NOT NULL DEFAULT '',
    createdAt TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`);


/*
|--------------------------------------------------------------------------
| DEFAULT LEGEND
|--------------------------------------------------------------------------
*/

const legendCount =
  db.prepare(`
    SELECT COUNT(*) AS count
    FROM legend
  `).get().count;

if (legendCount === 0) {

  const insertLegend =
    db.prepare(`
      INSERT INTO legend (
        abbreviation,
        meaning,
        description
      )
      VALUES (?, ?, ?)
    `);

  const defaultLegend = [
    [
      "TW",
      "Trim Wall",
      "Trim stored on the trim wall."
    ],

    [
      "CR",
      "Carpet Rack",
      "Carpet stored on the carpet rack."
    ],

    [
      "FPallet",
      "Floor Pallet",
      "Usually a pallet containing multiple orders that is stored somewhere on the warehouse floor."
    ],

    [
      "TWShelf",
      "Trim Wall Shelf",
      "Material stored on a shelf at the trim wall."
    ],

    [
      "Wall Corner",
      "Wall Corner",
      "Material stored at the corner or end of a warehouse wall."
    ],

    [
      "A / B / C",
      "Rack Section",
      "The letter identifies the section of a warehouse rack location, such as 6A, 6B, or 6C."
    ]
  ];

  const insertMany =
    db.transaction(
      (entries) => {

        for (
          const entry of entries
        ) {

          insertLegend.run(
            entry[0],
            entry[1],
            entry[2]
          );

        }

      }
    );

  insertMany(defaultLegend);
}


/*
|--------------------------------------------------------------------------
| UPDATE SERVER DIRECTORY
|--------------------------------------------------------------------------
|
| This directory contains:
|
| RELEASES
| *.nupkg
|
|--------------------------------------------------------------------------
*/

const updateDirectory =
  path.resolve(
    __dirname,
    "updates"
  );


/*
|--------------------------------------------------------------------------
| SERVER INFORMATION
|--------------------------------------------------------------------------
*/

console.log("");
console.log("==========================================");
console.log(" Warehouse Part Locator Server");
console.log("==========================================");
console.log("");

console.log("Database:");
console.log(databasePath);
console.log("");

console.log("Update directory:");
console.log(updateDirectory);
console.log("");

console.log("Server:");
console.log(`http://localhost:${PORT}`);
console.log("");

console.log("Network:");
console.log(`http://${SERVER_HOSTNAME}:${PORT}`);
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
        "application/json; charset=utf-8",

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
| GET LEGEND
|--------------------------------------------------------------------------
*/

function getLegend() {

  return db.prepare(`
    SELECT
      id,
      abbreviation,
      meaning,
      description,
      createdAt
    FROM legend
    ORDER BY abbreviation COLLATE NOCASE ASC
  `).all();

}


/*
|--------------------------------------------------------------------------
| SERVE UPDATE FILE
|--------------------------------------------------------------------------
*/

function serveUpdateFile(
  req,
  res,
  pathname
) {

  /*
   * Only allow:
   *
   * /updates/win32/x64/RELEASES
   * /updates/win32/x64/*.nupkg
   *
   */

  const updatePrefix =
    "/updates/";

  if (
    !pathname.startsWith(
      updatePrefix
    )
  ) {

    return false;

  }


  const relativePath =
    pathname
      .substring(
        updatePrefix.length
      )
      .replace(
        /^\/+/,
        ""
      );


  /*
   * Prevent directory traversal.
   */

  if (
    relativePath.includes("..")
  ) {

    sendError(
      res,
      403,
      "Access denied."
    );

    return true;

  }


  const filePath =
    path.resolve(
      updateDirectory,
      relativePath
    );


  const updateRoot =
    path.resolve(
      updateDirectory
    );


  if (
    !filePath.startsWith(
      updateRoot + path.sep
    )
  ) {

    sendError(
      res,
      403,
      "Access denied."
    );

    return true;

  }


  if (
    !fs.existsSync(filePath)
  ) {

    sendError(
      res,
      404,
      "Update file not found."
    );

    return true;

  }


  const stats =
    fs.statSync(filePath);


  if (
    !stats.isFile()
  ) {

    sendError(
      res,
      404,
      "Update file not found."
    );

    return true;

  }


  if (
    req.method !== "GET" &&
    req.method !== "HEAD"
  ) {

    sendError(
      res,
      405,
      "Method not allowed."
    );

    return true;

  }


  const extension =
    path.extname(
      filePath
    ).toLowerCase();


  let contentType =
    "application/octet-stream";


  if (
    path.basename(filePath) ===
    "RELEASES"
  ) {

    contentType =
      "text/plain; charset=utf-8";

  } else if (
    extension === ".nupkg"
  ) {

    contentType =
      "application/octet-stream";

  }


  res.writeHead(
    200,
    {
      "Content-Type":
        contentType,

      "Content-Length":
        stats.size,

      "Access-Control-Allow-Origin":
        "*",

      "Cache-Control":
        "no-cache"
    }
  );


  if (
    req.method === "HEAD"
  ) {

    res.end();

    return true;

  }


  fs.createReadStream(
    filePath
  ).pipe(res);


  return true;

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


        /*
        |--------------------------------------------------------------------------
        | URL
        |--------------------------------------------------------------------------
        */

        const url =
          new URL(
            req.url,
            `http://${req.headers.host || "localhost"}`
          );

        const pathname =
          url.pathname;


        /*
        |--------------------------------------------------------------------------
        | UPDATE FILES
        |--------------------------------------------------------------------------
        */

        if (
          serveUpdateFile(
            req,
            res,
            pathname
          )
        ) {

          return;

        }


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
              String(
                part.partNumber ?? ""
              ).trim(),

              String(
                part.customerName ?? ""
              ).trim(),

              String(
                part.poNumber ?? ""
              ).trim(),

              String(
                part.location ?? ""
              ).trim(),

              Number(
                part.quantity
              ) || 0,

              String(
                part.notes ?? ""
              ).trim()
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
        | GET LEGEND
        |--------------------------------------------------------------------------
        */

        if (
          req.method === "GET" &&
          pathname === "/legend"
        ) {

          const legend =
            getLegend();


          sendJSON(
            res,
            200,
            {
              success: true,
              legend
            }
          );

          return;

        }


        /*
        |--------------------------------------------------------------------------
        | ADD LEGEND ENTRY
        |--------------------------------------------------------------------------
        */

        if (
          req.method === "POST" &&
          pathname === "/legend"
        ) {

          const entry =
            await readBody(req);


          const abbreviation =
            String(
              entry.abbreviation || ""
            ).trim();


          const meaning =
            String(
              entry.meaning || ""
            ).trim();


          const description =
            String(
              entry.description || ""
            ).trim();


          if (
            !abbreviation ||
            !meaning
          ) {

            sendError(
              res,
              400,
              "Abbreviation and meaning are required."
            );

            return;

          }


          const result =
            db.prepare(`
              INSERT INTO legend (
                abbreviation,
                meaning,
                description
              )
              VALUES (?, ?, ?)
            `).run(
              abbreviation,
              meaning,
              description
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
        | LEGEND ID ROUTE
        |--------------------------------------------------------------------------
        */

        const legendMatch =
          pathname.match(
            /^\/legend\/(\d+)$/
          );


        if (
          legendMatch
        ) {

          const id =
            Number(
              legendMatch[1]
            );


          /*
          |--------------------------------------------------------------------------
          | UPDATE LEGEND
          |--------------------------------------------------------------------------
          */

          if (
            req.method === "PUT"
          ) {

            const entry =
              await readBody(req);


            const abbreviation =
              String(
                entry.abbreviation || ""
              ).trim();


            const meaning =
              String(
                entry.meaning || ""
              ).trim();


            const description =
              String(
                entry.description || ""
              ).trim();


            if (
              !abbreviation ||
              !meaning
            ) {

              sendError(
                res,
                400,
                "Abbreviation and meaning are required."
              );

              return;

            }


            const result =
              db.prepare(`
                UPDATE legend
                SET
                  abbreviation = ?,
                  meaning = ?,
                  description = ?
                WHERE id = ?
              `).run(
                abbreviation,
                meaning,
                description,
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


          /*
          |--------------------------------------------------------------------------
          | DELETE LEGEND
          |--------------------------------------------------------------------------
          */

          if (
            req.method === "DELETE"
          ) {

            const result =
              db.prepare(`
                DELETE FROM legend
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


        if (
          match
        ) {

          const id =
            Number(
              match[1]
            );

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
          | UPDATE PART
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

                String(
                  part.partNumber ?? ""
                ).trim(),

                String(
                  part.customerName ?? ""
                ).trim(),

                String(
                  part.poNumber ?? ""
                ).trim(),

                String(
                  part.location ?? ""
                ).trim(),

                Number(
                  part.quantity
                ) || 0,

                String(
                  part.notes ?? ""
                ).trim(),

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


        if (
          !res.headersSent
        ) {

          sendError(
            res,
            500,
            error.message ||
              "Internal server error."
          );

        }

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
  () => {

    console.log(
      `Server listening on ${SERVER_HOSTNAME}:${PORT}`
    );

  }
);


/*
|--------------------------------------------------------------------------
| SHUTDOWN
|--------------------------------------------------------------------------
*/

function shutdown() {

  console.log(
    "\nShutting down..."
  );

  try {

    db.close();

  } catch (error) {

    console.error(
      "Database close error:",
      error
    );

  }


  server.close(
    () => {

      process.exit(0);

    }
  );

}


process.on(
  "SIGINT",
  shutdown
);

process.on(
  "SIGTERM",
  shutdown
);
