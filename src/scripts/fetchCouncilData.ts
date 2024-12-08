import { EtlDatabase } from "@/lib/EtlDatabase";
import { TorontoCouncilClient } from "@/lib/TorontoCouncilClient";

async function main() {
  const db = new EtlDatabase();
  try {
    await db.createRawAgendaItemsTable();
    const client = new TorontoCouncilClient();
    const agendaItems = await client.getAgendaItems(
      { year: 2024, month: 9, day: 1 },
      { year: 2024, month: 11, day: 1 },
    );
    await db.bulkInsertRawAgendaItems(agendaItems);
  } finally {
    await db.release();
  }
}

main().then(console.log).catch(console.error);
