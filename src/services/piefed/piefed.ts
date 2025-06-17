import createClient from "openapi-fetch";

import { paths } from "./schema";

class PiefedClient {
  private client: ReturnType<typeof createClient<paths>>;

  constructor(
    hostname: string,
    otherHeaders?: Record<string, string>,
    jwt?: string,
  ) {
    this.client = createClient({
      baseUrl: `https://${hostname}/api/alpha`,
      headers: {
        ...otherHeaders,
        ...(jwt ? { Authorization: `Bearer ${jwt}` } : {}),
      },
    });
  }

  async resolveObject(
    payload: NonNullable<
      paths["/resolve_object"]["get"]["parameters"]["query"]
    >["ResolveObject"],
  ) {
    const response = await this.client.GET("/resolve_object", {
      // @ts-expect-error TODO: fix this
      params: { query: payload },
    });

    return response.data!;
  }
}

export default PiefedClient;
