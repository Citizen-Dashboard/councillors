import { Term } from "@/scripts/dbsetup";
import { PsqlDatabase } from "./PsqlDatabase";

export class EtlDatabase {
  private readonly db = new PsqlDatabase();

  public async release() {
    this.db.release();
  }

  public async createRawVoteTable() {
    await this.db.execute`
      DROP TABLE IF EXISTS "RawVotes";
      CREATE TABLE "RawVotes" (
        "term" TEXT NOT NULL,
        "committeeName" TEXT NOT NULL,
        "committeeSlug" TEXT NOT NULL,
        "dateTime" TEXT NOT NULL,
        "agendaItemNumber" TEXT NOT NULL,
        "agendaItemTitle" TEXT NOT NULL,
        "motionType" TEXT NOT NULL,
        "vote" TEXT NOT NULL,
        "result" TEXT NOT NULL,
        "voteDescription" TEXT NOT NULL,
        "inputRowNumber" BIGINT NOT NULL,
        "contactName" TEXT NOT NULL,
        "contactSlug" TEXT NOT NULL
      );
    `;
  }

  public async createRawContactTable() {
    await this.db.execute`
      DROP TABLE IF EXISTS "RawContacts";
      CREATE TABLE "RawContacts" (
        "primaryRole" TEXT NOT NULL,
        "email" TEXT NOT NULL,
        "photoUrl" TEXT,
        "website" TEXT,
        "addressLine1" TEXT,
        "addressLine2" TEXT,
        "locality" TEXT,
        "postalCode" TEXT,
        "province" TEXT,
        "phone" TEXT,
        "fax" TEXT,
        "personalWebsite" TEXT,
        "term" TEXT NOT NULL,
        "inputRowNumber" BIGINT NOT NULL,
        "wardId" TEXT,
        "wardName" TEXT,
        "wardSlug" TEXT,
        "contactName" TEXT NOT NULL,
        "contactSlug" TEXT NOT NULL
      );
    `;
  }

  public async bulkInsertRawVotes(rowStream: AsyncIterable<RawVoteRow>) {
    const rows = new Array<RawVoteRow>();
    for await (const row of rowStream) {
      rows.push(row);
    }
    await this.db.execute`
      WITH json_data AS (
        SELECT jsonb_array_elements(${JSON.stringify(rows)}::JSONB) AS data
      )
      INSERT INTO "RawVotes" (
        "term",
        "committeeName",
        "committeeSlug",
        "dateTime",
        "agendaItemNumber",
        "agendaItemTitle",
        "motionType",
        "vote",
        "result",
        "voteDescription",
        "inputRowNumber",
        "contactName",
        "contactSlug"
      )
      SELECT
        data->>'term',
        data->>'committeeName',
        data->>'committeeSlug',
        data->>'dateTime',
        data->>'agendaItemNumber',
        data->>'agendaItemTitle',
        data->>'motionType',
        data->>'vote',
        data->>'result',
        data->>'voteDescription',
        (data->>'inputRowNumber')::BIGINT,
        data->>'contactName',
        data->>'contactSlug'
      FROM json_data
    `;
  }

  public async bulkInsertRawContacts(rowStream: AsyncIterable<RawContactRow>) {
    const rows = new Array<RawContactRow>();
    for await (const row of rowStream) {
      rows.push(row);
    }
    await this.db.execute`
      WITH json_data AS (
        SELECT jsonb_array_elements(${JSON.stringify(rows)}::JSONB) AS data
      )
      INSERT INTO "RawContacts" (
        "primaryRole",
        "email",
        "photoUrl",
        "website",
        "addressLine1",
        "addressLine2",
        "locality",
        "postalCode",
        "province",
        "phone",
        "fax",
        "personalWebsite",
        "term",
        "inputRowNumber",
        "wardId",
        "wardName",
        "wardSlug",
        "contactName",
        "contactSlug"
      )
      SELECT
        data->>'primaryRole',
        data->>'email',
        data->>'photoUrl',
        data->>'website',
        data->>'addressLine1',
        data->>'addressLine2',
        data->>'locality',
        data->>'postalCode',
        data->>'province',
        data->>'phone',
        data->>'fax',
        data->>'personalWebsite',
        data->>'term',
        (data->>'inputRowNumber')::BIGINT,
        data->>'wardId',
        data->>'wardName',
        data->>'wardSlug',
        data->>'contactName',
        data->>'contactSlug'
      FROM json_data
    `;
  }

  public async createMatViews() {
    await this.db.execute`
      DROP MATERIALIZED VIEW IF EXISTS "Contacts";
    `;
    await this.db.execute`
      CREATE MATERIALIZED VIEW "Contacts" AS
      SELECT
        DISTINCT ON ("contactSlug")
        "contactName",
        "contactSlug",
        "photoUrl",
        "email",
        "phone"
      FROM (
        SELECT * FROM "RawContacts"
        ORDER BY "term" DESC
      )
    `;
    await this.db.execute`
      DROP MATERIALIZED VIEW IF EXISTS "Councillors";
    `;
    await this.db.execute`
      CREATE MATERIALIZED VIEW "Councillors" AS
      SELECT
        DISTINCT ON ("term", "wardSlug")
        "contactSlug",
        "wardSlug",
        "term"
      FROM "RawContacts"
      WHERE "primaryRole" = 'Councillor'
        AND "term" = (
          SELECT max("term") FROM "RawContacts"
        )
      ORDER BY "term" desc
    `;
    await this.db.execute`
      DROP MATERIALIZED VIEW IF EXISTS "Wards";
    `;
    await this.db.execute`
      CREATE MATERIALIZED VIEW "Wards" AS
      SELECT DISTINCT
        "wardSlug",
        "wardName",
        "wardId"
      FROM "RawContacts"
      WHERE "wardId" IS NOT NULL
    `;
    await this.db.execute`
      DROP MATERIALIZED VIEW IF EXISTS "Committees";
    `;
    await this.db.execute`
      CREATE MATERIALIZED VIEW "Committees" AS
      SELECT DISTINCT
        "committeeSlug",
        "committeeName"
      FROM "RawVotes"
    `;
    await this.db.execute`
      DROP MATERIALIZED VIEW IF EXISTS "AgendaItems";
    `;
    await this.db.execute`
      CREATE MATERIALIZED VIEW "AgendaItems" AS
      SELECT DISTINCT
        "agendaItemNumber",
        "agendaItemTitle"
      FROM "RawVotes"
    `;
    await this.db.execute`
      DROP MATERIALIZED VIEW IF EXISTS "ProblemAgendaItems" CASCADE;
    `;
    await this.db.execute`
      CREATE MATERIALIZED VIEW "ProblemAgendaItems" AS
      SELECT
        "agendaItemNumber",
        COUNT(DISTINCT "result")
      FROM "RawVotes"
      GROUP BY (
        "agendaItemNumber",
        "motionType",
        "voteDescription",
        "dateTime"
      )
      HAVING COUNT(DISTINCT "result") > 1
    `;
    await this.db.execute`
      DROP MATERIALIZED VIEW IF EXISTS "Motions";
    `;
    await this.db.execute`
      CREATE MATERIALIZED VIEW "Motions" AS
      SELECT DISTINCT
        "agendaItemNumber",
        "motionType",
        "voteDescription",
        "dateTime",
        "committeeSlug",
        "result"
      FROM "RawVotes"
      WHERE "agendaItemNumber" NOT IN (
        SELECT "agendaItemNumber"
        FROM "ProblemAgendaItems"
      )
    `;
    await this.db.execute`
      DROP MATERIALIZED VIEW IF EXISTS "Votes";
    `;
    await this.db.execute`
      CREATE MATERIALIZED VIEW "Votes" AS
      SELECT DISTINCT
        "agendaItemNumber",
        "motionType",
        "voteDescription",
        "dateTime",
        "committeeSlug",
        "contactSlug",
        "vote" as "value"
      FROM "RawVotes"
      WHERE "agendaItemNumber" NOT IN (
        SELECT "agendaItemNumber"
        FROM "ProblemAgendaItems"
      )
    `;
  }
}

type RawVoteRow = {
  term: string;
  committeeName: string;
  committeeSlug: string;
  dateTime: string;
  agendaItemNumber: string;
  agendaItemTitle: string;
  motionType: string;
  vote: string;
  result: string;
  voteDescription: string;
  inputRowNumber: number;
  contactName: string;
  contactSlug: string;
};

type RawContactRow = {
  primaryRole: string;
  email: string;
  photoUrl: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  locality: string | null;
  postalCode: string | null;
  province: string | null;
  phone: string | null;
  fax: string | null;
  personalWebsite: string | null;
  term: Term;
  inputRowNumber: number | null;
  wardId: string | null;
  wardName: string | null;
  wardSlug: string | null;
  contactName: string;
  contactSlug: string;
};
