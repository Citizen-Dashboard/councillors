import {
  db,
  sql as sqlRaw,
  type QueryResultRow,
  type QueryResult,
  type QueryResultBase,
  type VercelPoolClient,
} from "@vercel/postgres";

import { config } from "@/lib/config";

import { neonConfig, types } from "@neondatabase/serverless";

const isDbLocal =
  config.VERCEL_ENV === "development" && config.POSTGRES_HOST === "localhost";

if (isDbLocal) {
  console.log("Using local PSQL connection");
  if (!config.DEVELOPMENT_NEON_PORT)
    throw new Error(`Missing env var "DEVELOPMENT_NEON_PORT"`);
  neonConfig.wsProxy = (host) => {
    console.log("Calculating WS Proxy", host);
    return `${host}:${config.DEVELOPMENT_NEON_PORT}/v1`;
  };
  neonConfig.useSecureWebSocket = false;
  neonConfig.pipelineTLS = false;
  neonConfig.pipelineConnect = false;
}

// Workaround to force use of WS Proxy instead of fetch proxy for one off queries
const developmentSql = async <O extends QueryResultRow = EmptyObject>(
  strings: TemplateStringsArray,
  ...values: DbPrimitive[]
): Promise<QueryResult<O>> => {
  const db = new PsqlDatabase();
  try {
    const result = await db.execute<O>(strings, ...values);
    return result;
  } finally {
    db.release();
  }
};

export const sql = isDbLocal ? developmentSql : sqlRaw;

const integerParser = (value: string): number => {
  const int = parseInt(value);
  if (isNaN(int)) throw new Error(`Unable to parse integer "${value}"`);
  if (int >= Number.MAX_SAFE_INTEGER)
    throw new Error(`Integer "${value}" exceeds maximum safe size`);
  return int;
};

types.setTypeParser(types.builtins.INT8, integerParser);

type DbPrimitive = string | number | boolean | undefined | null;

type SingleQueryResult<O extends QueryResultRow> = QueryResultBase & {
  rows: [O];
};

type EmptyObject = Record<never, never>;

export class PsqlDatabase {
  private readonly clientPromise: Promise<VercelPoolClient>;

  constructor() {
    // Makes sure the config is loaded before trying to use it
    void config;
    this.clientPromise = db.connect();
  }

  public async release() {
    const client = await this.clientPromise;
    await client.release();
  }

  public async execute<O extends QueryResultRow = EmptyObject>(
    strings: TemplateStringsArray,
    ...values: DbPrimitive[]
  ): Promise<QueryResult<O>> {
    const client = await this.clientPromise;
    return client.sql(strings, ...values);
  }

  public async executeSingle<O extends QueryResultRow = EmptyObject>(
    strings: TemplateStringsArray,
    ...values: DbPrimitive[]
  ): Promise<SingleQueryResult<O>> {
    const result = await this.execute(strings, ...values);
    if (result.rowCount !== 1)
      throw new Error(`Expected 1 row but got ${result.rowCount}`);
    return result as SingleQueryResult<O>;
  }

  public async updateSingle<O extends QueryResultRow = EmptyObject>(
    strings: TemplateStringsArray,
    ...values: DbPrimitive[]
  ): Promise<SingleQueryResult<O>> {
    const result = await this.execute(strings, ...values);
    if (result.rowCount !== 1)
      throw new Error(
        `Expected to update 1 row, but instead updated ${result.rowCount}`,
      );
    return result as SingleQueryResult<O>;
  }
}
