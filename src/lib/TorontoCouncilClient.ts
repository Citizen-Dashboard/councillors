import { DayDate, dayDateToIsoString } from "./DateUtils";

export class TorontoCouncilClient {
  private readonly csrfUrl = "https://secure.toronto.ca/council/api/csrf.json";
  private readonly agendaItemUrl =
    "https://secure.toronto.ca/council/api/multiple/agenda-items.json";
  private readonly staticHeaders = {
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/102.0.0.0 Safari/537.36",
  };

  private cookies = new Array<string>();

  private async getCsrfCookies() {
    const response = await fetch(this.csrfUrl, { headers: this.staticHeaders });
    if (!response.ok) throw new Error(`Failed to get CSRF ${response.status}`);
    const cookies = response.headers.getSetCookie();
    if (cookies.length === 0)
      throw new Error(`CSRF response did not include cookie`);
    return cookies;
  }

  private async init() {
    if (!this.cookies.length) this.cookies = await this.getCsrfCookies();
  }

  private getXsrfToken(): string {
    const relevantCookie = this.cookies.find((cookie) =>
      cookie.toLowerCase().startsWith("xsrf-token"),
    );
    if (!relevantCookie)
      throw new Error(`No XSRF-TOKEN cookie present`, { cause: this.cookies });
    const cookieValue = relevantCookie.substring(
      relevantCookie.indexOf("=") + 1,
      relevantCookie.indexOf(";"),
    );
    if (!cookieValue) throw new Error(`No XSRF-TOKEN value present in cookie`);
    return cookieValue;
  }

  public async getAgendaItems(
    meetingFromDate: DayDate,
    meetingToDate: DayDate,
  ): Promise<AgendaItemRecord[]> {
    await this.init();
    const firstPage = await this.getAgendaItemsPage(
      meetingFromDate,
      meetingToDate,
    );
    const pagePromises = new Array<Promise<AgendaItemResponse>>();
    for (let pageNumber = 1; pageNumber < firstPage.TotalPages; pageNumber++) {
      pagePromises.push(
        this.getAgendaItemsPage(meetingFromDate, meetingToDate, pageNumber),
      );
    }
    const pages = await Promise.all([firstPage, ...pagePromises]);
    return pages.flatMap((page) => page.Records);
  }

  private async getAgendaItemsPage(
    meetingFromDate: DayDate,
    meetingToDate: DayDate,
    pageNumber = 0,
    pageSize = 200,
  ): Promise<AgendaItemResponse> {
    const searchParams = new URLSearchParams(
      Object.entries({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        sortOrder: "meetingDate",
      }),
    );

    const url = `${this.agendaItemUrl}?${searchParams}`;
    console.log(`Grabbing page of agenda items`, url);
    const response = await fetch(url, {
      method: "POST",
      body: JSON.stringify({
        includeTitle: "True",
        includeSummary: "True",
        includeRecommendations: "True",
        includeDecisions: "True",
        meetingFromDate: dayDateToIsoString(meetingFromDate),
        meetingToDate: dayDateToIsoString(meetingToDate),
      }),
      headers: {
        ...this.staticHeaders,
        cookie: this.cookies.join("; "),
        "Content-Type": "application/json",
        "X-XSRF-TOKEN": this.getXsrfToken(),
      },
    });
    if (!response.ok)
      throw new Error(`Failed to get agenda items ${response.status}`);
    const page: AgendaItemResponse = await response.json();
    if (!page.Records?.length) {
      throw new Error(`No records found in page`);
    }
    console.log("Grabbed page of agenda items", {
      ...page,
      Records: `Array<${page.Records.length}>`,
    });
    return page;
  }
}

type AgendaItemResponse = {
  TotalRecordCount: number;
  TotalPages: number;
  PageSize: number;
  Records: AgendaItemRecord[];
  PageNumber: number;
  result: "OK";
};

type AgendaItemRecord = {
  id: string;
  termId: number;
  agendaItemId: number;
  councilAgendaItemId: number;
  decisionBodyId: number;
  meetingId: number;
  itemProcessId: number;
  decisionBodyName: string;
  meetingDate: number;
  reference: string; // '2024.CA20.1',
  termYear: string;
  agendaCd: string;
  meetingNumber: string;
  itemStatus: string;
  agendaItemTitle: string;
  agendaItemSummary: string; // HTML
  agendaItemRecommendation: string; // HTML
  subjectTerms: string;
  wardId: number[];
  backgroundAttachmentId: number[];
  agendaItemAddress: Array<{
    agendaItemId: number;
    addressId: number;
    streetNumber: string;
    streetName: string;
    streetType: string;
    city: string;
    province: string;
    country: string;
    postalCode: string;
    latitude: number;
    longitude: number;
    fullAddress: string;
  }>;
};
