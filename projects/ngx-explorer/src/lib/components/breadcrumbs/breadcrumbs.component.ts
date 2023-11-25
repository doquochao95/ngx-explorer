import { Component, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { INode } from '../../shared/types';
import { ExplorerService } from '../../services/explorer.service';
import { DefaultConfig } from '../../shared/default-config';

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

    constructor(private explorerService: ExplorerService, private config: DefaultConfig) {
        this.sub.add(this.explorerService.breadcrumbs.subscribe(n => this.buildBreadcrumbs(n)));
    }

    private buildBreadcrumbs(nodes: INode[]) {
        this.breadcrumbs = nodes.map(n =>
            ({ name: n.data?.name || this.config.globalOptions.homeNodeName, node: n })
        );
    }

    public click(crumb: Breadcrumb) {
        this.explorerService.openNode(crumb.node.id);
    }

    public ngOnDestroy() {
        this.sub.unsubscribe();
    }

}
