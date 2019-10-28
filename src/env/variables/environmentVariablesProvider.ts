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
    private changeEventEmitter: EventEmitter<Uri | undefined>;
    constructor(private envVarsService: IEnvironmentVariablesService,
        disposableRegistry: Disposable[],
        private platformService: IPlatformService,
        private workspaceService: IWorkspaceService,
        private process: ICurrentProcess) {
        disposableRegistry.push(this);
        this.changeEventEmitter = new EventEmitter();
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
}