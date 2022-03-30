import { PrismaClient } from "@prisma/client";

let db: PrismaClient;

declare global {
  var __db: PrismaClient | undefined;
}

// this is needed because in development we don't want to restart
// the server with every change, but we want to make sure we don't
// create a new connection to the DB with every change either.
if (process.env.NODE_ENV === "production") {
  try {
    db = new PrismaClient();
    db.$connect();
  } catch (e) {
    console.error("Error connecting: " + JSON.stringify(e));
  }
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
    try {
      global.__db.$connect();
    } catch (e) {
      console.error("Error connecting: " + JSON.stringify(e));
    }
  }
  db = global.__db;
}

export { db };
