import { GlobalBase } from './../../common/global-base';
import { Component, Input, OnInit, ViewEncapsulation, booleanAttribute, AfterContentInit } from '@angular/core';
import { BaseView } from '../../directives/base-view.directive';

function capitalizeString(input: string): string {
    return input ? input.charAt(0).toUpperCase() + input.slice(1) : input
}
@Component({
    selector: 'nxe-explorer',
    templateUrl: './explorer.component.html',
    styleUrls: ['./explorer.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ExplorerComponent extends BaseView implements OnInit, AfterContentInit {

    @Input({ alias: 'read-only', transform: booleanAttribute }) readOnly: boolean
    @Input({ alias: 'auto-refresh', transform: booleanAttribute }) autoRefresh: boolean
    @Input({ alias: 'refresh-interval' }) autoRefreshInterval: number;
    @Input({ alias: 'offset-top' }) offSetTop: number;
    @Input({ alias: 'offset-right' }) offSetRight: number;
    @Input({ alias: 'offset-bottom' }) offSetBottom: number;
    @Input({ alias: 'offset-left' }) offSetLeft: number;
    @Input({ alias: 'main-node', transform: capitalizeString }) homeNodeName: string
    @Input({ alias: 'view-type', transform: capitalizeString }) defaultViewType: string

    constructor(
        public globalbase: GlobalBase
    ) {
        super()
    }

    ngOnInit() {
        if (this.readOnly != undefined)
            this.globalbase.config.globalOptions.readOnly = this.readOnly
        if (this.autoRefresh != undefined)
            this.globalbase.config.globalOptions.autoRefresh = this.autoRefresh
        if (this.homeNodeName != undefined)
            this.globalbase.config.globalOptions.homeNodeName = this.homeNodeName
        if (this.autoRefreshInterval != undefined)
            this.globalbase.config.globalOptions.autoRefreshInterval = this.autoRefreshInterval
        if (this.defaultViewType != undefined)
            this.globalbase.config.globalOptions.defaultViewType = this.defaultViewType
        if (this.offSetTop != undefined)
            this.globalbase.config.globalOptions.offSetTop = this.offSetTop
        if (this.offSetRight != undefined)
            this.globalbase.config.globalOptions.offSetRight = this.offSetRight
        if (this.offSetBottom != undefined)
            this.globalbase.config.globalOptions.offSetBottom = this.offSetBottom
        if (this.offSetLeft != undefined)
            this.globalbase.config.globalOptions.offSetLeft = this.offSetLeft
    }
    ngAfterContentInit() {
        this.globalbase.explorerService.refresh()
        this.globalbase.explorerService.getFilterStringFromSPA().subscribe((res: string) => {
            if (!(res == null || res.match(/^\s*$/) !== null || res =='undefined'))
                this.globalbase.filterString.next(res)
        })
    }
}
