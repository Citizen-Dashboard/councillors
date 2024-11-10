import { Gutters } from "@/components/ui/gutters";
import { PageHeading } from "@/components/ui/typography";
import { ExternalLink } from "@/components/ui/external-link";
import { sql } from "@/lib/PsqlDatabase";

import { unstable_cache } from "next/cache";

const getAllWards = unstable_cache(async () => {
  const response = await sql<{
    wardId: string;
    wardName: string;
    wardSlug: string;
  }>`
    SELECT
      "wardId",
      "wardName",
      "wardSlug"
    FROM "Wards"
    ORDER BY "wardId"::INT
  `;
  return response.rows;
});

// Todo: List actually useful ward details and link to ward pages
export default async function Wards() {
  const wards = await getAllWards();
  return (
    <Gutters>
      <main>
        <PageHeading>Wards of Toronto</PageHeading>
        <p>
          Not sure which ward you are in?{" "}
          <ExternalLink className="underline" href={findOutLink}>
            Find out here.
          </ExternalLink>
        </p>
        <ul className="ml-6 ">
          {wards.map((wards) => (
            <li key={wards.wardSlug}>
              <span>{wards.wardId}.</span> {wards.wardName}
            </li>
          ))}
        </ul>
      </main>
    </Gutters>
  );
}

const findOutLink = `https://www.toronto.ca/city-government/data-research-maps/neighbourhoods-communities/ward-profiles/`;
