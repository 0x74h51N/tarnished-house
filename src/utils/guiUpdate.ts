export function createGuiUpdater<
  Keys extends string,
  Handlers extends Record<Keys, ((v: any) => void) | undefined>
>(handlers: Handlers) {
  return function <K extends keyof Handlers>(
    key: K,
    value: Parameters<NonNullable<Handlers[K]>>[0]
  ) {
    handlers[key]?.(value);
  };
}
