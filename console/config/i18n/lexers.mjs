import EventEmitter from "node:events";
import jsonc from "comment-json";

/**
 * Custom JSONC parser for localizing keys matching format: /%.+%/
 */
export class CustomJsonLexer extends EventEmitter {
  constructor() {
    super();
  }

  /**
   * @param {string} content
   * @param {string} filename
   * @returns {Array<string>}
   */
  extract(content, filename) {
    /** @type {Array<{ key: string }>} */
    let keys = [];
    try {
      jsonc.parse(
        content,
        (_, value) => {
          if (typeof value === "string") {
            const match = value.match(/^%(.+)%$/);
            if (match && match[1]) {
              keys.push({ key: match[1] });
            }
          }

          return value;
        },
        true // Removes comments
      );
    } catch (e) {
      this.emit("warning", "Failed to parse as JSON: " + filename, e);
      keys = [];
    }

    return keys;
  }
}
