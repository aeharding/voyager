/*
 * This file is needed for a migration to lemmy v1
 *
 * After Voyager requires v1, this file can be removed
 */

export function getApId(obj: { actor_id: string }): string;
export function getApId(obj: { ap_id: string }): string;
export function getApId(
  obj: { actor_id: string } | undefined,
): string | undefined;
export function getApId(obj: { ap_id: string } | undefined): string | undefined;
export function getApId(obj: undefined): undefined;
export function getApId(
  obj: { ap_id?: string } | { actor_id?: string } | undefined,
): string | undefined {
  if (!obj) return;
  if ("ap_id" in obj) return obj.ap_id;
  if ("actor_id" in obj) return obj.actor_id;
}

export function getCounts<T extends { counts: unknown }>(obj: T): T["counts"];
export function getCounts(obj: undefined): undefined;
export function getCounts<T extends { counts: unknown }>(
  obj: T | undefined,
): T["counts"] | undefined;
export function getCounts(
  obj: { counts: unknown } | NonNullable<unknown> | undefined,
) {
  if (!obj) return;

  // Lemmy v0 *View and *Response objects
  if ("counts" in obj) return obj.counts;

  // Lemmy v1 *Response objects
  if ("comment" in obj) return obj.comment;
  if ("post" in obj) return obj.post;
  if ("person" in obj) return obj.person;

  // Lemmy v1 *View objects
  return obj;
}
