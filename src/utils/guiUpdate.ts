export function createGuiUpdater<
  Keys extends string,
  // biome-ignore lint/suspicious/noExplicitAny: too long to fix this
  Handlers extends Record<Keys, ((v: any) => void) | undefined>
>(handlers: Handlers) {
  return <K extends keyof Handlers>(
    key: K,
    value: Parameters<NonNullable<Handlers[K]>>[0]
  ) => {
    handlers[key]?.(value);
  };
}
