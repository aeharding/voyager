export default class PiefedClient {
  private readonly url: string;

  constructor(url: string) {
    this.url = `${url}/api/alpha`;
  }

  async getComment(id: number): Promise<string> {
    const response = await fetch(`${this.url}/comment?id=${id}`);
    const json = await response.json();

    return json.data.comment_view.comment.ap_id;
  }
}
