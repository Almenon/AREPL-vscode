// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

import { ConfigurationChangeEvent, Disposable, Event, EventEmitter, FileSystemWatcher, Uri, WorkspaceConfiguration } from 'vscode';
import { IWorkspaceService } from '../application/types';
import { IPlatformService } from '../platform/types';
import { ICurrentProcess } from '../types';
import { EnvironmentVariables, IEnvironmentVariablesProvider, IEnvironmentVariablesService } from './types';

const cacheDuration = 60 * 60 * 1000;
export class EnvironmentVariablesProvider implements IEnvironmentVariablesProvider, Disposable {
    public trackedWorkspaceFolders = new Set<string>();
    private fileWatchers = new Map<string, FileSystemWatcher>();
    private disposables: Disposable[] = [];
    private changeEventEmitter: EventEmitter<Uri | undefined>;
    constructor(private envVarsService: IEnvironmentVariablesService,
        disposableRegistry: Disposable[],
        private platformService: IPlatformService,
        private workspaceService: IWorkspaceService,
        private process: ICurrentProcess) {
        disposableRegistry.push(this);
        this.changeEventEmitter = new EventEmitter();
        const disposable = this.workspaceService.onDidChangeConfiguration(this.configurationChanged, this);
        this.disposables.push(disposable);
    }

    public get onDidEnvironmentVariablesChange(): Event<Uri | undefined> {
        return this.changeEventEmitter.event;
    }

    public dispose() {
        this.changeEventEmitter.dispose();
        this.fileWatchers.forEach(watcher => {
            if (watcher) {
                watcher.dispose();
            }
        });
    }

    public async getEnvironmentVariables(envFilePath: string, workspaceFolderUri?: Uri): Promise<EnvironmentVariables> {
        this.trackedWorkspaceFolders.add(workspaceFolderUri ? workspaceFolderUri.fsPath : '');
        this.createFileWatcher(envFilePath, workspaceFolderUri);
        let mergedVars = await this.envVarsService.parseFile(envFilePath, this.process.env);
        if (!mergedVars) {
            mergedVars = {};
        }
        this.envVarsService.mergeVariables(this.process.env, mergedVars);
        const pathVariable = this.platformService.pathVariableName;
        const pathValue = this.process.env[pathVariable];
        if (pathValue) {
            this.envVarsService.appendPath(mergedVars, pathValue);
        }
        if (this.process.env.PYTHONPATH) {
            this.envVarsService.appendPythonPath(mergedVars, this.process.env.PYTHONPATH);
        }
        return mergedVars;
    }
    public configurationChanged(e: ConfigurationChangeEvent) {
        this.trackedWorkspaceFolders.forEach(item => {
            const uri = item && item.length > 0 ? Uri.file(item) : undefined;
            if (e.affectsConfiguration('python.envFile', uri) || e.affectsConfiguration('AREPL.envFile', uri)) {
                this.onEnvironmentFileChanged(uri);
            }
        });
    }
    public createFileWatcher(envFile: string, workspaceFolderUri?: Uri) {
        if (this.fileWatchers.has(envFile)) {
            return;
        }
        const envFileWatcher = this.workspaceService.createFileSystemWatcher(envFile);
        this.fileWatchers.set(envFile, envFileWatcher);
        if (envFileWatcher) {
            this.disposables.push(envFileWatcher.onDidChange(() => this.onEnvironmentFileChanged(workspaceFolderUri)));
            this.disposables.push(envFileWatcher.onDidCreate(() => this.onEnvironmentFileChanged(workspaceFolderUri)));
            this.disposables.push(envFileWatcher.onDidDelete(() => this.onEnvironmentFileChanged(workspaceFolderUri)));
        }
    }
    private getWorkspaceFolderUri(resource?: Uri): Uri | undefined {
        if (!resource) {
            return;
        }
        const workspaceFolder = this.workspaceService.getWorkspaceFolder(resource!);
        return workspaceFolder ? workspaceFolder.uri : undefined;
    }
    private onEnvironmentFileChanged(workspaceFolderUri?: Uri) {
        this.changeEventEmitter.fire(workspaceFolderUri);
    }
}