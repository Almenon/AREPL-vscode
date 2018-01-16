"use strict"
import * as vscode from 'vscode';

export default class Utilities {
    static isEmpty(obj:Object) {
        return Object.keys(obj).length === 0;
    }

    private static entityMap = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;',
        '/': '&#x2F;',
        '`': '&#x60;',
        '=': '&#x3D;'
    };
      
    /**
     * see https://stackoverflow.com/a/12034334/6629672
     * @param string
     */
    static escapeHtml (string: string) {
        return string.replace(/[&<>"'`=\/]/g, function (s) {
            return Utilities.entityMap[s];
        });
    }
}