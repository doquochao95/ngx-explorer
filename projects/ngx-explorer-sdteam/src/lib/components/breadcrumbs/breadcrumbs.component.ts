import { Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { INode } from '../../shared/types';
import { ExplorerService } from '../../services/explorer.service';
import { DefaultConfig } from '../../shared/default-config';
import { GlobalBase } from '../../common/global-base';

interface Breadcrumb {
    node: INode;
    name: string;
}

@Component({
    selector: 'nxe-breadcrumbs',
    templateUrl: './breadcrumbs.component.html',
    styleUrls: ['./breadcrumbs.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class BreadcrumbsComponent implements OnDestroy {

    public breadcrumbs: Breadcrumb[] = [];
    private sub = new Subscription();

    constructor(public globalbase: GlobalBase) {
        this.sub.add(this.globalbase.explorerService.breadcrumbs.subscribe(n => this.buildBreadcrumbs(n)));
    }

    private buildBreadcrumbs(nodes: INode[]) {
        this.breadcrumbs = nodes.map(n =>
            ({ name: n.data?.name || this.globalbase.config.globalOptions.homeNodeName, node: n })
        );
    }

    public ngOnDestroy() {
        this.sub.unsubscribe();
    }

}
