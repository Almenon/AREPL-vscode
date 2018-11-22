"use strict"

export default class Utilities {
    static isEmpty(obj: {}) {
        return Object.keys(obj).length === 0;
    }

    static sleep(ms: number): Promise<void> {
        return new Promise(resolve => {
          setTimeout(resolve, ms)
        })
      }
      
    /**
     * see https://stackoverflow.com/a/12034334/6629672
     * @param string
     */
    static escapeHtml(input: string) {
        if (input == null) return null;
        return input.replace(/[&<>"'`=\/]/g, function(s) {
            return Utilities.entityMap[s];
        });
    }
    
    private static entityMap = {
        '"': "&quot;",
        "&": "&amp;",
        "'": "&#39;",
        "/": "&#x2F;",
        "<": "&lt;",
        "=": "&#x3D;",
        ">": "&gt;",
        "`": "&#x60;",
    };
}
