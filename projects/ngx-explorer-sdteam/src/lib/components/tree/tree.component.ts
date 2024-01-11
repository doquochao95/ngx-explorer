import { Component, ViewEncapsulation } from '@angular/core';
import { BaseView } from '../../directives/base-view.directive';
import { GlobalBase } from '../../common/global-base';

@Component({
    selector: 'nxe-tree',
    templateUrl: './tree.component.html',
    styleUrls: ['./tree.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class TreeComponent extends BaseView {
    constructor(
        public globalbase: GlobalBase
    ) {
        super()
    }
}
