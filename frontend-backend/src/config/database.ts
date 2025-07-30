import mysql from "mysql2/promise";
import dotenv from "dotenv";

dotenv.config();

export async function initializeDatabase() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL environment variable is not defined");
  }

  const [userInfo, hostInfo] = databaseUrl.split("@");
  const [user, password] = userInfo.split("://")[1].split(":");
  const [host, portAndDb] = hostInfo.split(":");
  const [port, dbName] = portAndDb.split("/");

  const connection = await mysql.createConnection({
    host: host || "localhost",
    port: parseInt(port) || 3306,
    user: user || "root",
    password: password || "password",
  });

  const finalDbName = dbName.split("?")[0] || "frontend_file_library";
  await connection.query(`CREATE DATABASE IF NOT EXISTS ${finalDbName}`);
  await connection.end();
}
