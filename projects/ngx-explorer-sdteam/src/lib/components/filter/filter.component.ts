import { Component, ElementRef, ViewChild } from '@angular/core';
import { BaseView } from '../../directives/base-view.directive';
import { GlobalBase } from '../../common/global-base';

@Component({
    selector: 'nxe-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss']
})
export class FilterComponent extends BaseView {
    @ViewChild('input') input: ElementRef<HTMLInputElement>;
    constructor(
        public globalbase: GlobalBase
    ) {
        super();
    }
}
