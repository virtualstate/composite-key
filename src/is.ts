/* c8 ignore start */
export function isLike<T>(value: unknown, ...and: unknown[]): value is T {
  if (!and.length) return !!value;
  return !!value && and.every((value) => !!value);
}

export function ok(
    value: unknown,
    message?: string,
    ...conditions: unknown[]
): asserts value;
export function ok<T>(
    value: unknown,
    message?: string,
    ...conditions: unknown[]
): asserts value is T;
export function ok(
    value: unknown,
    message?: string,
    ...conditions: unknown[]
): asserts value {
  if (conditions.length ? !conditions.every((value) => value) : !value) {
    throw new Error(message ?? "Expected value");
  }
}
