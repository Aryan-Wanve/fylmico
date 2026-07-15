export type QueuedMessage = {
  tempId: string;
  roomId: string;
  body: string;
  parentMessageId?: string;
};

const STORAGE_KEY = "fylmico:chat-outbox";

function readQueue(): QueuedMessage[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as QueuedMessage[]) : [];
  } catch {
    return [];
  }
}

function writeQueue(queue: QueuedMessage[]): void {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(queue));
}

// Messages that failed to send due to a network error (not a server
// rejection) live here until the tab comes back online, so a dropped
// connection doesn't silently lose what the user typed.
export function enqueueMessage(entry: QueuedMessage): void {
  writeQueue([...readQueue(), entry]);
}

export function dequeueMessage(tempId: string): void {
  writeQueue(readQueue().filter((entry) => entry.tempId !== tempId));
}

export function getQueuedMessages(): QueuedMessage[] {
  return readQueue();
}
