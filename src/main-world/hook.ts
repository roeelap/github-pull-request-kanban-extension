import { post, type BridgeMessage } from '../content/bridge';

const RELEVANT_PATTERNS = [/\/_graphql/, /\/pull\/\d+/, /\/check-runs/];

function isRelevant(url: string): boolean {
  return RELEVANT_PATTERNS.some((re) => re.test(url));
}

const originalFetch = window.fetch.bind(window);

window.fetch = async function patchedFetch(...args) {
  const response = await originalFetch(...args);
  try {
    const url = typeof args[0] === 'string' ? args[0] : (args[0] as Request).url;
    if (isRelevant(url)) {
      const clone = response.clone();
      clone
        .json()
        .then((body) => {
          const message: BridgeMessage = url.includes('_graphql')
            ? { kind: 'graphql_response', url, body }
            : { kind: 'rest_response', url, body };
          post(message);
        })
        .catch(() => undefined);
    }
  } catch {
    // ignore — passive tap
  }
  return response;
};

const OriginalXHR = window.XMLHttpRequest;
class PatchedXHR extends OriginalXHR {
  private _url: string = '';
  open(method: string, url: string | URL, ...rest: unknown[]): void {
    this._url = typeof url === 'string' ? url : url.toString();
    // @ts-expect-error variadic forwarding
    super.open(method, url, ...rest);
  }
  send(body?: Document | XMLHttpRequestBodyInit | null): void {
    this.addEventListener('load', () => {
      try {
        if (!isRelevant(this._url)) return;
        const text = this.responseText;
        if (!text) return;
        const parsed = JSON.parse(text);
        const message: BridgeMessage = this._url.includes('_graphql')
          ? { kind: 'graphql_response', url: this._url, body: parsed }
          : { kind: 'rest_response', url: this._url, body: parsed };
        post(message);
      } catch {
        // ignore
      }
    });
    super.send(body);
  }
}
window.XMLHttpRequest = PatchedXHR;
