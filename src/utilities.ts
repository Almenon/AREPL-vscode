"use strict"

import { EOL } from "os";

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
     * returns trimmed last line (split by \n)
     */
    static getLastLine(input: string){
        // even on windows python uses newline :/
        // not sure if it's just my python setup?
        return input.slice(input.lastIndexOf('\n')).trim()
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
