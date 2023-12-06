const syntaxChars = /[\^$\\.*+?()[\]{}|]/g;

/**
 * Escapes all special special regex characters in a given string
 * so that it can be passed to `new RegExp(escaped, ...)` to match all given
 * characters literally.
 *
 * inspired by https://github.com/es-shims/regexp.escape/blob/master/implementation.js
 *
 * @param {string} s
 */
export function escapeStringForRegex(s: string) {
  return s.replace(syntaxChars, "\\$&");
}
