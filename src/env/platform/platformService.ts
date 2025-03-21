// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.
'use strict';

import * as os from 'os';
import { getOSType, OSType } from '../utils/platform';
import { NON_WINDOWS_PATH_VARIABLE_NAME, WINDOWS_PATH_VARIABLE_NAME } from './constants';
import { IPlatformService } from './types';

export class PlatformService implements IPlatformService {
    public readonly osType: OSType = getOSType();
    constructor() {}
    public get pathVariableName() {
        return this.isWindows ? WINDOWS_PATH_VARIABLE_NAME : NON_WINDOWS_PATH_VARIABLE_NAME;
    }
    public get virtualEnvBinName() {
        return this.isWindows ? 'Scripts' : 'bin';
    }

    public get isWindows(): boolean {
        return this.osType === OSType.Windows;
    }
    public get isMac(): boolean {
        return this.osType === OSType.OSX;
    }
    public get isLinux(): boolean {
        return this.osType === OSType.Linux;
    }
    public get osRelease(): string {
        return os.release();
    }
    public get is64bit(): boolean {
        // tslint:disable-next-line:no-require-imports
        const arch = require('arch');
        return arch() === 'x64';
    }
}