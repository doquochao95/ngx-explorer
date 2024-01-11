import { Component, ViewEncapsulation } from '@angular/core';

import { BaseView } from '../../directives/base-view.directive';
import { GlobalBase } from '../../common/global-base';

@Component({
    selector: 'nxe-menu-bar',
    templateUrl: './menu-bar.component.html',
    styleUrls: ['./menu-bar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MenuBarComponent extends BaseView {
    constructor(
        public globalbase: GlobalBase
    ) {
        super();
    }
    openUploader() {
        this.globalbase.openUploader(this.upload, this.uploader)
    }
    openModalCreate() {
        this.globalbase.openModalModify(this.modify)
    }
    openModalRename() {
        this.globalbase.openModalModify(this.modify, true)
    }
}
