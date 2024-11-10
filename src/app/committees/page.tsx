import { Gutters } from "@/components/ui/gutters";
import { PageHeading } from "@/components/ui/typography";
import { sql } from "@/lib/PsqlDatabase";
import { unstable_cache } from "next/cache";

const getAllCommittees = unstable_cache(async () => {
  const response = await sql<{
    committeeName: string;
    committeeSlug: string;
    agendaItemCount: number;
  }>`
    SELECT
      "committeeName",
      "committeeSlug",
      COUNT (DISTINCT "agendaItemNumber") as "agendaItemCount"
    FROM "Committees"
    INNER JOIN "Motions"
      using ("committeeSlug")
    GROUP BY "committeeName", "committeeSlug"
    ORDER BY 3 desc
  `;
  return response.rows;
});

// Todo: Display actually relevant details and link to each committe page
export default async function Committees() {
  const comittees = await getAllCommittees();
  return (
    <Gutters>
      <main>
        <PageHeading>Committees of Toronto</PageHeading>
        <ul className="list-disc ml-6 ">
          {comittees.map((committee) => (
            <li key={committee.committeeSlug}>
              {committee.committeeName}
              <span> ({committee.agendaItemCount})</span>
            </li>
          ))}
        </ul>
      </main>
    </Gutters>
  );
}
