import { Component, ViewEncapsulation } from '@angular/core';
import { BaseView } from '../../directives/base-view.directive';
import { FileTypeIconClass } from '../../shared/types';
import { GlobalBase } from '../../common/global-base';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
    selector: 'nxe-icons',
    templateUrl: './icons.component.html',
    styleUrls: ['./icons.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class IconsComponent extends BaseView {

    icon = FileTypeIconClass.Folder
    constructor(
        public globalbase: GlobalBase,
        public _sanitizer: DomSanitizer
    ) {
        super();
    }
    checkEmpty(str: string) {
        return !str || /^\s*$/.test(str);
    }
    openContextMenu(item?: any) {
        item ?
            this.globalbase.openContextMenu(this.modify, this.upload, this.uploader, item) :
            this.globalbase.openContextMenu(this.modify, this.upload, this.uploader)
    }
}
