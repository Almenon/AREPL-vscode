import { EOL } from "os";
import {} from "vscode"
import type { TextDocument, WorkspaceFolder, TextLine, Position, Range, StatusBarItem, Extension, TreeDataProvider, Command, TreeItemCollapsibleState } from "vscode"
import { URI } from 'vscode-uri'

// adapted from https://github.com/rokucommunity/vscode-brightscript-language/blob/master/src/mockVscode.spec.ts

export let vscodeMock = {
    CompletionItem: class { },
    CodeLens: class { },
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
    extensions: {
		getExtension: function(extensionId: string): Extension<any> | undefined {
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
                },

                extensionKind: null,

                exports: null,

                activate: ()=>{return new Promise(()=>{})}
            }
        },
		all: [],
		onDidChange: null,
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

        },
        executeCommand: () => {

        }
    },
    context: {
        subscriptions: [],
        asAbsolutePath: function() { }
    },
    workspace: {
        workspaceFolders: [<WorkspaceFolder>{
            uri: URI.parse(""),
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
                    if(section == "pyGuiLibraries") return []
                }
            };
        },
        onDidChangeConfiguration: () => {
            return {
                "dispose": ()=>{}
            }
        },
        onDidChangeWorkspaceFolders: () => { },
        findFiles: (include, exclude) => {
            return [];
        },
        registerTextDocumentContentProvider: () => { },
        onDidChangeTextDocument: () => { },
        onDidCloseTextDocument: () => { },
        openTextDocument: (content: string)=>new Promise(()=><TextDocument>{})
    },
    window: {
        createOutputChannel: function() {
            return {
                show: () => { },
                clear: () => { },
                appendLine: () => { }
            };
        },
        registerTreeDataProvider: function(viewId: string, treeDataProvider: TreeDataProvider<any>) { },
        showErrorMessage: function(message: string) {

        },
        activeTextEditor: {
            document: undefined
        },
        onDidChangeTextEditorSelection: () => { },
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
        public show() { }
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

        readonly uri: URI;
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
        public getWordRangeAtPosition(position: Position, regex?: RegExp): Range | undefined { return undefined};
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
		public offsetAt(position: Position): number {return -1};
		public positionAt(offset: number): Position {return null};
    },
    TreeItem: class {
        constructor(label: string, collapsibleState?: TreeItemCollapsibleState) {
            this.label = label;
            this.collapsibleState = collapsibleState;
        }
        public readonly label: string;
        public readonly iconPath?: string | URI | { light: string | URI; dark: string | URI };
        public readonly command?: Command;
        public readonly collapsibleState?: TreeItemCollapsibleState;
        public readonly contextValue?: string;
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
    Uri: URI.parse(""),
    SnippetString: class {
        constructor(value: string = null) {
            this.value = value;
        }
        private value: string;
    },
};