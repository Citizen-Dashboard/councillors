import { Readable } from "stream";
import { ReadableStream } from "node:stream/web";

export class OpenDataClient {
  private readonly baseUrl = `https://ckan0.cf.opendata.inter.prod-toronto.ca`;

  private asQueryParams(
    queryParams: Record<string, number | string | null | boolean>,
  ) {
    return new URLSearchParams(
      Object.entries(queryParams) as [string, string][],
    );
  }

  private async apiFetch<T>(
    path: `/api/${string}`,
    init?: RequestInit,
  ): Promise<T> {
    const response = await fetch(new URL(path, this.baseUrl), {
      ...init,
      headers: {
        accept: "application/json",
        ...init?.headers,
      },
    });
    if (!response.ok)
      throw new Error(
        `OpenDataClient failed to fetch API with ${response.status}`,
      );

    try {
      return await response.json();
    } catch (cause) {
      throw new Error(`OpenDataClient received invalid JSON`, { cause });
    }
  }

  public async fetchDataset(url: string, init?: RequestInit) {
    if (!url.startsWith(this.baseUrl))
      throw new Error(`Dataset URL is not on open data origin`);
    const response = await fetch(url, init);
    if (!response.ok)
      throw new Error(
        `OpenDataClient failed to fetch dataset ${url} with ${response.status}`,
      );

    if (!response.body)
      throw new Error(`OpenDataClient found no response body`);

    return Readable.fromWeb(response.body as ReadableStream);
  }

  public async showPackage(id: string) {
    return await this.apiFetch<{
      result: {
        last_refreshed: string;
        resources: Array<PackageResource>;
      };
    }>(`/api/3/action/package_show?${this.asQueryParams({ id })}`);
  }
}

export type PackageResource = {
  format: string;
  name: string;
  id: string;
  url: string;
  is_preview: boolean | null;
};
