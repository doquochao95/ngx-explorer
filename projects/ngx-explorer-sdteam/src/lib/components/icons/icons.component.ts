import { Component, Inject, ViewEncapsulation, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FILTER_STRING } from '../../injection-tokens/tokens';
import { ExplorerService } from '../../services/explorer.service';
import { HelperService } from '../../services/helper.service';
import { BaseView } from '../../directives/base-view.directive';
import { FileTypeIconClass } from '../../shared/types';
import { DomSanitizer } from '@angular/platform-browser';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
    selector: 'nxe-icons',
    templateUrl: './icons.component.html',
    styleUrls: ['./icons.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class IconsComponent extends BaseView implements AfterViewInit {

    icon = FileTypeIconClass.Folder
    constructor(
        explorerService: ExplorerService,
        helperService: HelperService,
        modalService: BsModalService,
        public _sanitizer: DomSanitizer,
        private cd: ChangeDetectorRef,
        @Inject(FILTER_STRING) filter: BehaviorSubject<string>
    ) {
        super(explorerService, helperService, modalService,  filter);
    }
    checkEmpty(str: string) {
        return !str || /^\s*$/.test(str);
    }
    ngAfterViewInit() {
        this.cd.markForCheck()
    }
}
