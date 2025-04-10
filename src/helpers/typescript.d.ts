export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends object ? DeepPartial<T[K]> : T[K];
};

/**
 * Creates a tuple of string literal types by combining a prefix string with each suffix in a tuple of strings.
 * This is particularly useful when you need to create a set of related string literal types
 * that share a common prefix, such as CSS class names or action types.
 *
 * @example
 * type ButtonVariants = PrefixedStringTuple<'btn-', ['primary', 'secondary', 'danger']>;
 * // Result: ['btn-primary', 'btn-secondary', 'btn-danger']
 * // Note: These are string literal types, not just string types.
 * // ButtonVariants[0] will, and can only be, 'btn-primary'
 *
 * @template Prefix - The string prefix to prepend to each suffix
 * @template Suffixes - A tuple of string suffixes to combine with the prefix
 */
export type PrefixedStringTuple<
  Prefix extends string,
  Suffixes extends readonly string[],
> = Suffixes extends readonly [
  infer First extends string,
  ...infer Rest extends string[],
]
  ? [`${Prefix}${First}`, ...PrefixedStringTuple<Prefix, Rest>]
  : [];
