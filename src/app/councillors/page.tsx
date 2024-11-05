import { sql } from "@/lib/PsqlDatabase";
import { unstable_cache } from "next/cache";
import Link from "next/link";

const getAllCouncillors = unstable_cache(async () => {
  const response = await sql<{
    contactSlug: string;
    contactName: string;
    photoUrl: string | null;
    wardName: string;
  }>`
    SELECT *
    FROM "Councillors"
    INNER JOIN "Contacts"
      USING ("contactSlug")
    INNER JOIN "Wards"
      USING ("wardSlug")
    `;
  return response.rows;
});

export default async function Councillors() {
  const councillors = await getAllCouncillors();
  return (
    <div className="max-w-screen-sm mx-auto">
      <h2 className="text-3xl">Councillors of Toronto</h2>
      <ul>
        {councillors.map((councillor) => (
          <li key={councillor.contactSlug} className="even:bg-zinc-50">
            <Link
              href={`/councillors/${councillor.contactSlug}`}
              className="p-2 mb-2 flex gap-2 hover:underline"
            >
              <img
                src={councillor.photoUrl!}
                className="bg-zinc-300"
                style={{ height: 52, width: 42 }}
                alt=""
              />
              <div>
                <h3 className="text-lg">{councillor.contactName}</h3>
                <p>{councillor.wardName}</p>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
