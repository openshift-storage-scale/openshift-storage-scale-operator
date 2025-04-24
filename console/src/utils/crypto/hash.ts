/**
 * Computes the SHA-1 digest of a given text string and returns it as a hexadecimal hash.
 *
 * @param text - The input string to be hashed.
 * @returns A promise that resolves to the hexadecimal representation of the SHA-1 hash.
 *
 * @example
 * ```typescript
 * const hash = await getDigest("example text");
 * console.log(hash); // Outputs the SHA-1 hash of "example text"
 * ```
 */
export const getDigest = async (text: string) => {
  const encoder = new TextEncoder();
  const bytes = encoder.encode(text);
  const buffer = await crypto.subtle.digest("SHA-1", bytes);
  const hashBytes = Array.from(new Uint8Array(buffer));
  const hash = hashBytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  return hash;
};