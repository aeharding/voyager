/**
 * This is needed for a migration to lemmy v1
 *
 * After Voyager requires v1, this function can be removed
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
