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
