import { Component, Input, OnDestroy, OnInit, ViewEncapsulation, booleanAttribute, Inject, AfterViewInit, AfterContentInit } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { DefaultConfig } from '../../shared/default-config';
import { ExplorerService } from '../../services/explorer.service';
import { BsModalService } from 'ngx-bootstrap/modal';
import { HelperService } from '../../services/helper.service';
import { BaseView } from '../../directives/base-view.directive';
import { FILTER_STRING } from '../../injection-tokens/tokens';

function capitalizeString(input: string): string {
    return input ? input.charAt(0).toUpperCase() + input.slice(1) : input
}
@Component({
    selector: 'nxe-explorer',
    templateUrl: './explorer.component.html',
    styleUrls: ['./explorer.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ExplorerComponent extends BaseView implements OnInit, OnDestroy, AfterContentInit {

    @Input({ alias: 'read-only', transform: booleanAttribute }) readOnly: boolean
    @Input({ alias: 'auto-refresh', transform: booleanAttribute }) autoRefresh: boolean
    @Input({ alias: 'refresh-interval' }) autoRefreshInterval: number;
    @Input({ alias: 'offset-top' }) offSetTop: number;
    @Input({ alias: 'offset-right' }) offSetRight: number;
    @Input({ alias: 'offset-bottom' }) offSetBottom: number;
    @Input({ alias: 'offset-left' }) offSetLeft: number;
    @Input({ alias: 'main-node', transform: capitalizeString }) homeNodeName: string
    @Input({ alias: 'view-type', transform: capitalizeString }) defaultViewType: string
    private sub = new Subscription();

    constructor(
        explorerService: ExplorerService,
        helperService: HelperService,
        modalService: BsModalService,
        public config: DefaultConfig,
        @Inject(FILTER_STRING) filter: BehaviorSubject<string>
    ) {
        super(explorerService, helperService, modalService, filter);
        this.sub.add(this.helperService.emitter.subscribe((res) => {
            if (res == null)
                this.explorerService.refresh()
            else
                this.filter.next(res)
        }));
    }

    ngOnInit() {
        if (this.readOnly != undefined)
            this.config.globalOptions.readOnly = this.readOnly
        if (this.autoRefresh != undefined)
            this.config.globalOptions.autoRefresh = this.autoRefresh
        if (this.homeNodeName != undefined)
            this.config.globalOptions.homeNodeName = this.homeNodeName
        if (this.autoRefreshInterval != undefined)
            this.config.globalOptions.autoRefreshInterval = this.autoRefreshInterval
        if (this.defaultViewType != undefined)
            this.config.globalOptions.defaultViewType = this.defaultViewType
        if (this.offSetTop != undefined)
            this.config.globalOptions.offSetTop = this.offSetTop
        if (this.offSetRight != undefined)
            this.config.globalOptions.offSetRight = this.offSetRight
        if (this.offSetBottom != undefined)
            this.config.globalOptions.offSetBottom = this.offSetBottom
        if (this.offSetLeft != undefined)
            this.config.globalOptions.offSetLeft = this.offSetLeft
    }
    ngOnDestroy() {
        this.sub.unsubscribe();
    }
    ngAfterContentInit() {
        this.explorerService.refresh()
    }
}
