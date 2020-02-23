import { EOL } from "os";
import {} from "vscode"

// adapted from https://github.com/rokucommunity/vscode-brightscript-language/blob/master/src/mockVscode.spec.ts
// todo: get rid of redeclarations of type once typescript 3.8 is released
// (typescript 3.8 lets you import types directly)


export interface TextDocument {
    readonly uri: Uri;
    readonly fileName: string;
    readonly isUntitled: boolean;
    readonly languageId: string;
    readonly version: number;
    readonly isDirty: boolean;
    readonly isClosed: boolean;
    save(): Thenable<boolean>;
    readonly eol: 1|2;
    readonly lineCount: number;
    lineAt(line: number): TextLine;
    lineAt(position: Position): TextLine;
    offsetAt(position: Position): number;
    positionAt(offset: number): Position;
    getText(range?: Range): string;
    getWordRangeAtPosition(position: Position, regex?: RegExp): Range | undefined;
    validateRange(range: Range): Range;
    validatePosition(position: Position): Position;
}

/**
 * In a remote window the extension kind describes if an extension
 * runs where the UI (window) runs or if an extension runs remotely.
 */
export enum ExtensionKind {

    /**
     * Extension runs where the UI runs.
     */
    UI = 1,

    /**
     * Extension runs where the remote extension host runs.
     */
    Workspace = 2
}

/**
 * Represents an extension.
 *
 * To get an instance of an `Extension` use [getExtension](#extensions.getExtension).
 */
export interface Extension<T> {

    /**
     * The canonical extension identifier in the form of: `publisher.name`.
     */
    readonly id: string;

    /**
     * The absolute file path of the directory containing this extension.
     */
    readonly extensionPath: string;

    /**
     * `true` if the extension has been activated.
     */
    readonly isActive: boolean;

    /**
     * The parsed contents of the extension's package.json.
     */
    readonly packageJSON: any;

    /**
     * The extension kind describes if an extension runs where the UI runs
     * or if an extension runs where the remote extension host runs. The extension kind
     * if defined in the `package.json` file of extensions but can also be refined
     * via the the `remote.extensionKind`-setting. When no remote extension host exists,
     * the value is [`ExtensionKind.UI`](#ExtensionKind.UI).
     */
    extensionKind: ExtensionKind;

    /**
     * The public API exported by this extension. It is an invalid action
     * to access this field before this extension has been activated.
     */
    readonly exports: T;

    /**
     * Activates this extension and returns its public API.
     *
     * @return A promise that will resolve when this extension has been activated.
     */
    activate(): Thenable<T>;
}

export interface WorkspaceFolder {
    readonly uri: Uri;
    readonly name: string;
    readonly index: number;
}

export interface Uri {
    parse(value: string, strict?: boolean): Uri;
    file(path: string): Uri;
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

class uri implements Uri {
    constructor(public scheme: string, public authority: string, public path: string, public query: string, public fragment: string){
        this.fsPath = path; // not exactly accurate but whatever
    };
    readonly fsPath: string
    parse(){return null}
    with(){return null}
    toJSON(){}
	file(path: string): Uri {
        return new uri("","","","","")
	}
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

/**
 * Represents the alignment of status bar items.
 */
export enum StatusBarAlignment {

    /**
     * Aligned to the left side.
     */
    Left = 1,

    /**
     * Aligned to the right side.
     */
    Right = 2
}

/**
 * A status bar item is a status bar contribution that can
 * show text and icons and run a command on click.
 */
export interface StatusBarItem {

    /**
     * The alignment of this item.
     */
    readonly alignment: StatusBarAlignment;

    /**
     * The priority of this item. Higher value means the item should
     * be shown more to the left.
     */
    readonly priority?: number;

    /**
     * The text to show for the entry. You can embed icons in the text by leveraging the syntax:
     *
     * `My text $(icon-name) contains icons like $(icon-name) this one.`
     *
     * Where the icon-name is taken from the [octicon](https://octicons.github.com) icon set, e.g.
     * `light-bulb`, `thumbsup`, `zap` etc.
     */
    text: string;

    /**
     * The tooltip text when you hover over this entry.
     */
    tooltip: string | undefined;

    /**
     * The foreground color for this entry.
     */
    color: string | undefined;

    /**
     * The identifier of a command to run on click. The command must be
     * [known](#commands.getCommands).
     */
    command: string | undefined;

    /**
     * Shows the entry in the status bar.
     */
    show(): void;

    /**
     * Hide the entry in the status bar.
     */
    hide(): void;

    /**
     * Dispose and free associated resources. Call
     * [hide](#StatusBarItem.hide).
     */
    dispose(): void;
}

export let vscodeMock = {
    StatusBarAlignment: {
		Left: 1,
		Right: 2
    },
	StatusBarItem: {
		alignment: {
            Left: 1,
            Right: 2
        },
		priority: 0,
		text: "",
		tooltip: "",
		color: "",
		command: "",
		show: ()=>{},
		hide: ()=>{},
		dispose: ()=>{}
	},
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
            uri: new uri("","","root","",""),
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
                get: function(section?: string, resource?: any) {
                    if(section == "enableTelemetry") return false
                }
            };
        },
        onDidChangeConfiguration: () => {
            return {
                "dispose": ()=>{}
            }
        },
        onDidChangeWorkspaceFolders: () => {

        },
        findFiles: (include, exclude) => {
            return [];
        },
        openTextDocument: (content: string)=>new Promise(()=><TextDocument>{})
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
        },
        createTextEditorDecorationType: function(){},
        showTextDocument: function(doc){
            return new Promise(()=>doc)
        },
        createStatusBarItem: function(alignment?: number, priority?: number):StatusBarItem{
            return {
                alignment: 0,
                priority: 0,
                text: "",
                tooltip: "",
                color: "",
                command: "",
                show: ()=>{},
                hide: ()=>{},
                dispose: ()=>{}
            }
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
    Uri: new uri("","","","",""),
    SnippetString: class {
        constructor(value: string = null) {
            this.value = value;
        }
        private value: string;
    },

    extensions: {
		getExtension: function(extensionId: string){
            return {
                id: "",

                /**
                 * The absolute file path of the directory containing this extension.
                 */
                extensionPath: "",
        
                /**
                 * `true` if the extension has been activated.
                 */
                isActive: true,
        
                /**
                 * The parsed contents of the extension's package.json.
                 */
                packageJSON: {
                    "version": "0.0.0"
                }
            }
        },
		all: [],
		onDidChange: null,
    }
};