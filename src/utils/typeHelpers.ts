export type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

export type NestedKeys<T> = {
  [K in keyof T]: T[K] extends object ? K | Join<K, NestedKeys<T[K]>> : K;
}[keyof T];

export type Split<
  S extends string,
  D extends string
> = S extends `${infer T}${D}${infer U}` ? [T, ...Split<U, D>] : [S];

export type PathValue<T, P extends string[]> = P extends [
  infer Head,
  ...infer Tail
]
  ? Head extends keyof T
    ? Tail extends string[]
      ? PathValue<T[Head], Tail>
      : never
    : never
  : T;

export type GetValue<T, K extends string> = PathValue<T, Split<K, ".">>;
