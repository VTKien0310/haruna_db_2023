const violations: string[] = [];

export function unexpectedInteraction(operation: string): never {
  const message = `Unexpected external interaction: ${operation}. Configure an in-memory fake.`;
  violations.push(message);
  throw new Error(message);
}

// Clear only after verification, so catching an application error cannot hide it.
export function assertNoUnexpectedInteractions(): void {
  const messages = violations.splice(0);
  if (messages.length) throw new Error(messages.join("\n"));
}
