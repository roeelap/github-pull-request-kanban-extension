export const BRIDGE_NAMESPACE = 'gh-pr-kanban';

export type BridgeMessage =
  | { kind: 'graphql_response'; url: string; body: unknown }
  | { kind: 'rest_response'; url: string; body: unknown };

export type BridgeListener = (msg: BridgeMessage) => void;

export function listen(handler: BridgeListener): () => void {
  const onMessage = (event: MessageEvent) => {
    if (event.source !== window) return;
    const data = event.data;
    if (!data || data.namespace !== BRIDGE_NAMESPACE) return;
    handler(data.message as BridgeMessage);
  };
  window.addEventListener('message', onMessage);
  return () => window.removeEventListener('message', onMessage);
}

export function post(message: BridgeMessage): void {
  window.postMessage({ namespace: BRIDGE_NAMESPACE, message }, window.location.origin);
}
