import { BsModalService } from 'ngx-bootstrap/modal';
import { HelperService } from './../../services/helper.service';
import { Component, Inject, OnDestroy, ViewEncapsulation } from '@angular/core';
import { ExplorerService } from '../../services/explorer.service';
import { Subscription, BehaviorSubject } from 'rxjs';
import { INode, TreeNode } from '../../shared/types';
import { DefaultConfig } from '../../shared/default-config';
import { FILTER_STRING } from '../../injection-tokens/tokens';
import { BaseView } from '../../directives/base-view.directive';

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
        @Inject(FILTER_STRING) filter: BehaviorSubject<string>
    ) {
        super(explorerService, helperService, modalService, config, filter);
    }
}
