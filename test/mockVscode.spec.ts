import { sep } from "path";
import { EOL } from "os";

// adapted from https://github.com/rokucommunity/vscode-brightscript-language/blob/master/src/mockVscode.spec.ts

export interface WorkspaceFolder {
    readonly uri: Uri;
    readonly name: string;
    readonly index: number;
}

export interface Uri {
    parse(value: string, strict?: boolean): Uri;
    file(path: string): Uri;
    constructor(scheme: string, authority: string, path: string, query: string, fragment: string);
    readonly scheme: string;
    readonly authority: string;
    readonly path: string;
    readonly query: string;
    readonly fragment: string;
    readonly fsPath: string;
    with(change: { scheme?: string; authority?: string; path?: string; query?: string; fragment?: string }): Uri;
    toString(skipEncoding?: boolean): string;
    toJSON(): any;
}

export interface TextLine {
    readonly lineNumber: number;
    readonly text: string;
    readonly range: Range;
    readonly rangeIncludingLineBreak: Range;
    readonly firstNonWhitespaceCharacterIndex: number;
    readonly isEmptyOrWhitespace: boolean;
}

export interface Position {
    readonly line: number;
    readonly character: number;
    constructor(line: number, character: number);
    isBefore(other: Position): boolean;
    isBeforeOrEqual(other: Position): boolean;
    isAfter(other: Position): boolean;
    isAfterOrEqual(other: Position): boolean;
    isEqual(other: Position): boolean;
    compareTo(other: Position): number;
    translate(lineDelta?: number, characterDelta?: number): Position;
    translate(change: { lineDelta?: number; characterDelta?: number; }): Position;
    with(line?: number, character?: number): Position;
    with(change: { line?: number; character?: number; }): Position;
}

export interface Range {
    readonly start: Position;
    readonly end: Position;
    constructor(start: Position, end: Position);
    constructor(startLine: number, startCharacter: number, endLine: number, endCharacter: number);
    isEmpty: boolean;
    isSingleLine: boolean;
    contains(positionOrRange: Position | Range): boolean;
    isEqual(other: Range): boolean;
    intersection(range: Range): Range | undefined;
    union(other: Range): Range;
    with(start?: Position, end?: Position): Range;
    with(change: { start?: Position, end?: Position }): Range;
}
export interface Selection extends Range {
    anchor: Position;
    active: Position;
    constructor(anchor: Position, active: Position);
    constructor(anchorLine: number, anchorCharacter: number, activeLine: number, activeCharacter: number);
    isReversed: boolean;
}

export let vscodeMock = {
    debug: {
        registerDebugConfigurationProvider: () => { },
        onDidStartDebugSession: () => { },
        onDidReceiveDebugSessionCustomEvent: () => { },
    },
    languages: {
        registerDefinitionProvider: () => { },
        registerDocumentSymbolProvider: () => { },
        registerWorkspaceSymbolProvider: () => { },
        registerDocumentRangeFormattingEditProvider: () => { },
        registerSignatureHelpProvider: () => { },
        registerReferenceProvider: () => { },
        registerDocumentLinkProvider: () => { },
        registerCompletionItemProvider: () => { },
        createDiagnosticCollection: () => {
            return {
                clear: () => { }
            };
        }
    },
    subscriptions: [],
    commands: {
        registerCommand: () => {

        }
    },
    context: {
        subscriptions: [],
    },
    workspace: {
        workspaceFolders: [<WorkspaceFolder>{
            uri: {
                fsPath: "root"
            },
            name: "foo",
            index: 0
        }],
        createFileSystemWatcher: () => {
            return {
                onDidCreate: () => {

                },
                onDidChange: () => {

                },
                onDidDelete: () => {

                }
            };
        },
        getConfiguration: function() {
            return {
                get: function() { }
            };
        },
        onDidChangeConfiguration: () => {

        },
        onDidChangeWorkspaceFolders: () => {

        },
        findFiles: (include, exclude) => {
            return [];
        }
    },
    window: {
        createOutputChannel: function() {
            return {
                show: () => { },
                clear: () => { }
            };
        },
        showErrorMessage: function(message: string) {

        },
        activeTextEditor: {
            document: undefined
        }
    },
    CompletionItemKind: {
        Function: 2
    },
    Disposable: class {
        public static from() {

        }
    },
    EventEmitter: class {
        public fire() {

        }
        public event() {
        }
    },
    DeclarationProvider: class {
        public onDidChange = () => {

        }
        public onDidDelete = () => {

        }
        public onDidReset = () => {

        }
        public sync = () => {

        }
    },
    OutputChannel: class {
        public clear() { }
        public appendLine() { }
    },
    DebugCollection: class {
        public clear() { }
        public set() { }
    },
    Position: class {
        constructor(line, character) {
            this.line = line;
            this.character = character;
        }
        private line: number;
        private character: number;
    },
    ParameterInformation: class {
        constructor(label: string, documentation?: string | any) {
            this.label = label;
            this.documentation = documentation;
        }
        private label: string;
        private documentation: string | any | undefined;
    },
    SignatureHelp: class {
        constructor() {
            this.signatures = [];
        }
        private signatures: any[];
        private activeParameter: number;
        private activeSignature: number;
    },
    SignatureInformation: class {
        constructor(label: string, documentation?: string | any) {
            this.label = label;
            this.documentation = documentation;
        }
        private label: string;
        private documentation: string | any | undefined;
    },
    Range: class {
        constructor(private startLine: number, private startCharacter: number, private endLine: number, private endCharacter: number) {
            this.start = <Position>{
                line:startLine,
                character: startCharacter
            }
            this.end = <Position>{
                line:endLine,
                character: endCharacter
            }
        }
        readonly start: Position
        readonly end: Position
        public isEmpty: boolean
        public isSingleLine: boolean
    },
    SymbolKind: {
        File: 0,
        Module: 1,
        Namespace: 2,
        Package: 3,
        Class: 4,
        Method: 5,
        Property: 6,
        Field: 7,
        Constructor: 8,
        Enum: 9,
        Interface: 10,
        Function: 11,
        Variable: 12,
        Constant: 13,
        String: 14,
        Number: 15,
        Boolean: 16,
        Array: 17,
        Object: 18,
        Key: 19,
        Null: 20,
        EnumMember: 21,
        Struct: 22,
        Event: 23,
        Operator: 24,
        TypeParameter: 25
    },
    TextDocument: class {
        constructor(fileName: string, private text: string) {
            this.fileName = fileName;
            this.lineCount = text.split(EOL).length
        }

        readonly uri: Uri;
        readonly isUntitled: boolean;
        readonly languageId: string;
        readonly version: number;
        readonly isDirty: boolean;
        readonly isClosed: boolean;
        readonly lineCount: number;
        public fileName: string;
        public eol: 1 | 2 = 1;
        public getText() { return this.text; }
        save(): Thenable<boolean> {return new Promise(()=>{});};
        public lineAt(line: number): TextLine {
            const splitText = this.text.split(EOL)
            return {
                lineNumber: line,
                text: splitText[line],
                range: <Range>{
                    start: <Position>{
                        line: line,
                    },
                    end: <Position>{
                        line: line
                    },
                    isEmpty: Boolean(this.text),
                    isSingleLine: true
                },
                rangeIncludingLineBreak: null,
                firstNonWhitespaceCharacterIndex: null,
                isEmptyOrWhitespace: null
            }
        };
		public offsetAt(position: Position): number {return 0};
		public positionAt(offset: number): Position {return null};
		public getWordRangeAtPosition(position: Position, regex?: RegExp): Range | undefined { return undefined};
    },
    DocumentLink: class {
        constructor(range: Range, uri: string) {
            this.range = range;
            this.uri = uri;
        }
        private range: any;
        private uri: string;
    },
    MarkdownString: class {
        constructor(value: string = null) {
            this.value = value;
        }
        private value: string;
    },
    Uri: class {
        constructor(public scheme: string, public authority: string, public path: string, public query: string, public fragment: string){
            this.fsPath = path; // not exactly accurate but whatever
        };
        readonly fsPath: string
        parse(){return null}
        with(){return null}
        toJSON(){}
        file(src: string){
            return null;
        }
    },
    SnippetString: class {
        constructor(value: string = null) {
            this.value = value;
        }
        private value: string;
    }
};