import { Component, Inject, Input, OnDestroy, OnInit, ViewEncapsulation, AfterViewInit, AfterContentInit } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { AvialableView } from '../../shared/types';
import { CURRENT_VIEW } from '../../injection-tokens/tokens';
import { coerceBooleanProperty } from '@angular/cdk/coercion';
import { DefaultConfig } from '../../shared/default-config';
import { ExplorerService } from '../../services/explorer.service';

@Component({
    selector: 'nxe-explorer',
    templateUrl: './explorer.component.html',
    styleUrls: ['./explorer.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ExplorerComponent implements OnInit, AfterContentInit, OnDestroy {

    private _readOnly: boolean;
    private _autoRefresh: boolean;

    @Input()
    set readOnly(readOnly: boolean | string) {
        this._readOnly = coerceBooleanProperty(readOnly);
    }
    @Input()
    set autoRefresh(autoRefresh: boolean | string) {
        this._autoRefresh = coerceBooleanProperty(autoRefresh);
    }
    @Input() autoRefreshInterval: number;
    @Input() homeNodeName: string

    public avialableView = AvialableView;
    public view: string;
    private sub = new Subscription();

    constructor(@Inject(CURRENT_VIEW) private currentView: BehaviorSubject<AvialableView>, private explorerService: ExplorerService, private config: DefaultConfig) {
        this.sub.add(this.currentView.subscribe(view => {
            this.view = view;
        }));
        this._readOnly = this.config.globalOptions.readOnly
        this._autoRefresh = this.config.globalOptions.autoRefresh
        this.homeNodeName = this.config.globalOptions.homeNodeName
        this.autoRefreshInterval = this.config.globalOptions.autoRefreshInterval
    }
    ngOnInit() {
        this.config.globalOptions.readOnly = this._readOnly
        this.config.globalOptions.autoRefresh = this._autoRefresh
        this.config.globalOptions.homeNodeName = this.homeNodeName
        this.config.globalOptions.autoRefreshInterval = this.autoRefreshInterval
    }
    ngOnDestroy() {
        this.sub.unsubscribe();
    }
    ngAfterContentInit() {
        this.explorerService.refresh()
    }
}
