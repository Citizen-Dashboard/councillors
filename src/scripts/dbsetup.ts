import { OpenDataClient, PackageResource } from "@/lib/OpenDataClient";
import openDataCatalog from "./openDataCatalog.json";
import { createOpenDataCsvParser } from "@/lib/OpenDataCsvHelpers";
import { toSlug } from "@/lib/TextUtils";
import { EtlDatabase } from "@/lib/EtlDatabase";

function isFullCsvResource(resource: PackageResource) {
  return (
    !resource.is_preview &&
    resource.format.toLocaleLowerCase() === "csv" &&
    resource.url.endsWith(".csv")
  );
}

export type Term = `${number}-${number}`;
export const findTermInText = (text: string): Term => {
  const groups = text.match(/\d\d\d\d-\d\d\d\d/);
  if (!groups) throw new Error(`Unable to find term in "${text}"`);
  return groups[0] as Term;
};

function toContactName(firstName: string, lastName: string) {
  const contactName = `${firstName.trim()} ${lastName.trim()}`;
  if (!firstName.trim())
    throw new Error(`Contact has no first name "${contactName}"`);
  if (!lastName.trim())
    throw new Error(`Contact has no last name "${contactName}"`);
  return contactName;
}

async function downloadAndPopulateRawContacts(db: EtlDatabase) {
  const openDataClient = new OpenDataClient();
  const contactPackage = await openDataClient.showPackage(
    openDataCatalog.contactInformation,
  );
  const resources = contactPackage.result.resources.filter(isFullCsvResource);
  for (const resource of resources) {
    const term = findTermInText(resource.name);
    const parser = createOpenDataCsvParser(RawContactColumns);
    const requestStream = await openDataClient.fetchDataset(resource.url);
    const rowStream = requestStream
      .pipe(parser)
      .filter((row) => row.firstName && row.lastName)
      .map(({ id, districtId, districtName, firstName, lastName, ...row }) => ({
        ...row,
        term,
        inputRowNumber: id,
        wardId: districtId,
        wardName: districtName,
        wardSlug: toSlug(districtName),
        contactName: toContactName(firstName, lastName),
        contactSlug: toSlug(toContactName(firstName, lastName)),
      }));
    await db.bulkInsertRawContacts(rowStream);
  }
}

async function downloadAndPopulateRawVotes(db: EtlDatabase) {
  const openDataClient = new OpenDataClient();
  const contactPackage = await openDataClient.showPackage(
    openDataCatalog.votingRecords,
  );
  const resources = contactPackage.result.resources.filter(isFullCsvResource);
  const [mostRecentResource] = resources
    .map((resource) => ({
      url: resource.url,
      term: findTermInText(resource.name),
    }))
    .sort((a, b) => b.term.localeCompare(a.term));

  const requestStream = await openDataClient.fetchDataset(
    mostRecentResource.url,
  );
  const parser = createOpenDataCsvParser(RawVoteColumns);
  const rowStream = requestStream
    .pipe(parser)
    .map(({ firstName, lastName, id, committee, ...row }) => ({
      ...row,
      term: mostRecentResource.term,
      inputRowNumber: id,
      contactName: toContactName(firstName, lastName),
      contactSlug: toSlug(toContactName(firstName, lastName)),
      committeeName: committee,
      committeeSlug: toSlug(committee),
    }));
  await db.bulkInsertRawVotes(rowStream);
}

const RawContactColumns = [
  "districtName",
  "districtId",
  "primaryRole",
  "firstName",
  "lastName",
  "email",
  "photoUrl",

  "id",
  "website",
  "addressLine1",
  "addressLine2",
  "locality",
  "postalCode",
  "province",
  "phone",
  "fax",
  "personalWebsite",
] as const;

const RawVoteColumns = [
  "id",
  "term",
  "firstName",
  "lastName",
  "committee",
  "dateTime",
  "agendaItemNumber",
  "agendaItemTitle",
  "motionType",
  "vote",
  "result",
  "voteDescription",
] as const;

async function main() {
  console.log("Hello from DBSetup");
  const db = new EtlDatabase();
  try {
    console.log("Setting up raw contacts");
    await db.createRawContactTable();
    await downloadAndPopulateRawContacts(db);

    console.log("Setting up raw votes");
    await db.createRawVoteTable();
    await downloadAndPopulateRawVotes(db);
  } finally {
    await db.release();
  }

  return "Finished";
}
main().then(console.log).catch(console.error);
