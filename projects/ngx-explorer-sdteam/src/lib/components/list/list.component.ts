import { Component, ViewEncapsulation } from '@angular/core';
import { BaseView } from '../../directives/base-view.directive';
import { FileTypeIconClass } from '../../shared/types';
import { GlobalBase } from '../../common/global-base';

@Component({
    selector: 'nxe-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ListComponent extends BaseView {

    icon = FileTypeIconClass.Folder
    constructor(
        public globalbase: GlobalBase
    ) {
        super();
    }
    openContextMenu(item?: any) {
        item ?
            this.globalbase.openContextMenu(this.modify, this.upload, this.uploader, item) :
            this.globalbase.openContextMenu(this.modify, this.upload, this.uploader)
    }
}
