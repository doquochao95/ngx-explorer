import { BsModalService } from 'ngx-bootstrap/modal';
import { HelperService } from './../../services/helper.service';
import { Component, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ExplorerService } from '../../services/explorer.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { DefaultConfig } from '../../shared/default-config';
import { FILTER_STRING } from '../../injection-tokens/tokens';
import { BaseView } from '../../directives/base-view.directive';
import { filter } from 'rxjs/operators';

@Component({
    selector: 'nxe-tree',
    templateUrl: './tree.component.html',
    styleUrls: ['./tree.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TreeComponent extends BaseView {
    constructor(
        explorerService: ExplorerService,
        helperService: HelperService,
        modalService: BsModalService,
        config: DefaultConfig,
        @Inject(FILTER_STRING) filterString: BehaviorSubject<string>
    ) {
        super(explorerService, helperService, modalService, config, filterString);
        this.subs.add(this.explorerService.tree
            .pipe(filter((x: any) => !!x))
            .subscribe(res => {
                this.addExpandedNode(res.node_Id);
                this.treeNodes = this.buildTree(res.node).children;
                this.clearSearchInput();
            }));
    }
}
