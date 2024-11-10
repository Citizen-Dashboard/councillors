import { PsqlDatabase } from "@/lib/PsqlDatabase";

async function main() {
  console.log("Hello from DB Test");
  const db = new PsqlDatabase();
  try {
    const result = await db.execute<{ name: string }>`
      SELECT table_name as "name"
      FROM information_schema.tables
      WHERE table_schema = 'public'
      UNION ALL
      SELECT matviewname as "name"
      FROM pg_matviews
    `;
    if (result.rowCount === 0) {
      console.log("Able to connect to DB, but found no tables or views");
    } else {
      console.log(
        "Able to connect to DB, found tables and views:",
        result.rows.map((row) => row.name),
      );
    }
  } finally {
    await db.release();
  }
  return "Finished";
}
main().then(console.log).catch(console.error);
