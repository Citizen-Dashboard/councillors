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

  public async getAgendaItem(
    meetingFromDate: DayDate,
    meetingToDate: DayDate,
    pageNumber = 1,
    pageSize = 200,
  ) {
    await this.init();
    const searchParams = new URLSearchParams(
      Object.entries({
        pageNumber: pageNumber.toString(),
        pageSize: pageSize.toString(),
        sortOrder: "meetingDate",
      }),
    );

    const response = await fetch(`${this.agendaItemUrl}?${searchParams}`, {
      method: "POST",
      body: JSON.stringify({
        includeTitle: "True",
        includeSummary: "True",
        includeRecommendations: "True",
        includeDecisions: "True",
        meetingFromDate:
          new Date(2024, 10, 1).toISOString() ||
          dayDateToIsoString(meetingFromDate),
        meetingToDate:
          new Date(2024, 11, 1).toISOString() ||
          dayDateToIsoString(meetingToDate),
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
    return await response.json();
  }
}
