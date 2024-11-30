import { ExternalLink } from "@/components/ui/external-link";
import { PageHeading } from "@/components/ui/typography";
import { sql } from "@/lib/PsqlDatabase";
import { unstable_cache } from "next/cache";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpenCheckIcon,
  CircleCheckBigIcon,
  CircleXIcon,
  NotebookPenIcon,
  UsersIcon,
  VoteIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

type ParamsType = {
  contactSlug: string;
};

export async function generateStaticParams() {
  const response =
    await sql<ParamsType>`SELECT "contactSlug" from "Councillors"`;
  return response.rows;
}

const getCouncillor = unstable_cache(async (contactSlug: string) => {
  const response = await sql<{
    contactSlug: string;
    contactName: string;
    photoUrl: string | null;
    wardName: string;
  }>`
    SELECT
      "contactSlug",
      "contactName",
      "photoUrl",
      "wardName"
    FROM "Councillors"
    INNER JOIN "Contacts"
      USING ("contactSlug")
    INNER JOIN "Wards"
      USING ("wardSlug")
    WHERE "contactSlug" = ${contactSlug}
    `;
  return response.rows[0] ?? null;
});

const getVotesByAgendaItemsForContact = unstable_cache(
  async (contactSlug: string) => {
    type Row = {
      agendaItemNumber: string;
      agendaItemTitle: string;
      motionType: string;
      voteDescription: string;
      dateTime: string;
      committeeSlug: string;
      value: string;
      result: string;
      resultKind: string;
    };
    // Todo: Include absences from same agenda items
    const response = await sql<Row>`
    SELECT
      "agendaItemNumber",
      "agendaItemTitle",
      "motionType",
      "voteDescription",
      "dateTime",
      "committeeSlug",
      "value",
      "result",
      "resultKind"
    FROM "Votes"
    INNER JOIN "Motions"
      USING ("agendaItemNumber", "motionId")
    INNER JOIN "AgendaItems"
    	USING ("agendaItemNumber")
    WHERE "contactSlug" = ${contactSlug}
    ORDER BY "dateTime" desc
  `;

    const groupedRows = new Map<Row["agendaItemNumber"], Row[]>();
    for (const row of response.rows) {
      const existingGroup = groupedRows.get(row.agendaItemNumber);
      if (existingGroup) existingGroup.push(row);
      else groupedRows.set(row.agendaItemNumber, [row]);
    }
    return [...groupedRows.values()].map((rows) => ({
      agendaItemNumber: rows[0]!.agendaItemNumber,
      agendaItemTitle: rows[0]!.agendaItemTitle,
      motions: rows,
    }));
  }
);

export default async function Councillor(props: {
  params: Promise<ParamsType>;
}) {
  const { contactSlug } = await props.params;
  const councillor = await getCouncillor(contactSlug);
  const agendaItems = await getVotesByAgendaItemsForContact(contactSlug);

  return (
    <main className="max-w-3xl mx-auto mt-4">
      {councillor && (
        <section className="mb-6">
          <div>
            <PageHeading>{councillor.contactName}</PageHeading>
            <h3 className="text-2xl font-semibold">{councillor.wardName}</h3>
          </div>
        </section>
      )}
      <Tabs defaultValue="voted">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger className="gap-1" value="voted">
            <VoteIcon />
            Voted ({agendaItems.length})
          </TabsTrigger>
          <TabsTrigger className="gap-1" value="authored">
            <NotebookPenIcon />
            Authored
          </TabsTrigger>
          <TabsTrigger className="gap-1" value="seconded">
            <BookOpenCheckIcon />
            Seconded
          </TabsTrigger>
          <TabsTrigger className="gap-1" value="committees">
            <UsersIcon />
            Committees
          </TabsTrigger>
        </TabsList>
        <TabsContent value="voted">
          <ol>
            {agendaItems.map((agendaItem) => (
              <li key={agendaItem.agendaItemNumber} className="py-4">
                <ExternalLink
                  href={`https://secure.toronto.ca/council/agenda-item.do?item=${agendaItem.agendaItemNumber}`}
                  className="text-lg p-2  block hover:underline"
                >
                  <h4 className="text-xl">{agendaItem.agendaItemTitle}</h4>
                  <h5 className="text-sm text-slate-800">
                    {agendaItem.agendaItemNumber}
                  </h5>
                </ExternalLink>
                <div>
                  <ol>
                    {agendaItem.motions.map((motion, index) => (
                      <li
                        key={index}
                        className="odd:bg-slate-50 p-2 hover:bg-slate-100"
                      >
                        <span
                          className={cn({
                            "font-semibold":
                              motion.motionType.includes("Adopt"),
                          })}
                        >
                          {motion.voteDescription}
                        </span>
                        <Outcome
                          resultKind={motion.resultKind}
                          result={motion.result}
                          vote={motion.value}
                        />
                      </li>
                    ))}
                  </ol>
                </div>
              </li>
            ))}
          </ol>
        </TabsContent>

        <TabsContent value="authored">Todo</TabsContent>
        <TabsContent value="seconded">Todo</TabsContent>
        <TabsContent value="committees">Todo</TabsContent>
      </Tabs>
    </main>
  );
}

const Outcome = (props: {
  resultKind: string;
  result: string;
  vote: string;
}) => (
  <div className="flex gap-2 items-center">
    {props.resultKind === "Lost" && <CircleXIcon size={20} />}
    {props.resultKind === "Carried" && <CircleCheckBigIcon size={20} />}
    <p>
      {props.result} <em>({props.vote})</em>
    </p>
  </div>
);
