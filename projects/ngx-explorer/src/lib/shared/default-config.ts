import { Inject, Injectable, Optional } from '@angular/core';
import { ExplorerOption, NgExplorerOption } from './types';
import { NGX_EXPLORER_OPTION } from '../injection-tokens/tokens';

const defaultConfig: ExplorerOption = {
    homeNodeName: 'Files',
    autoRefresh: false,
    readOnly: false,
    autoRefreshInterval: 10000
};
@Injectable({ providedIn: 'root' })
export class DefaultConfig {
    public globalOptions: NgExplorerOption;
    constructor(@Optional() @Inject(NGX_EXPLORER_OPTION) options: NgExplorerOption) {
        this.globalOptions = options ? { ...defaultConfig, ...options } : this.globalOptions = defaultConfig;
    }
}
