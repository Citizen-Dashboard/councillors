import { TorontoCouncilClient } from "@/lib/TorontoCouncilClient";

async function main() {
  const client = new TorontoCouncilClient();
  return client.getAgendaItem(
    { year: 2024, month: 9, day: 1 },
    { year: 2024, month: 11, day: 1 },
  );
}

main()
  .then((data) => console.dir(data, { depth: Infinity }))
  .catch(console.error);
