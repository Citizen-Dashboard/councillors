import { TorontoCouncilClient } from "@/lib/TorontoCouncilClient";

async function main() {
  const client = new TorontoCouncilClient();
  const items = await client.getAgendaItems(
    { year: 2024, month: 9, day: 1 },
    { year: 2024, month: 11, day: 1 },
  );
  console.log("Item count", items.length);
  const references = new Set(items.map((item) => item.reference));
  console.log("Reference count", references.size);
  const ids = new Set(items.map((item) => item.id));
  console.log("IDs count", ids.size);
}

main()
  .then((data) => console.dir(data, { depth: Infinity, maxArrayLength: null }))
  .catch(console.error);
