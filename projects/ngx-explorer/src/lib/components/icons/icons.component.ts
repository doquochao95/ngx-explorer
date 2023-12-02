import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FILTER_STRING } from '../../injection-tokens/tokens';
import { ExplorerService } from '../../services/explorer.service';
import { HelperService } from '../../services/helper.service';
import { BaseView } from '../base-view/base-view.directive';
import { FileTypeIconClass } from '../../shared/types';
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
        explorerService: ExplorerService,
        helperService: HelperService,
        public _sanitizer: DomSanitizer,
        @Inject(FILTER_STRING) filter: BehaviorSubject<string>
    ) {
        super(explorerService, helperService, filter);
    }
    checkEmpty(str: string) {
        return !str || /^\s*$/.test(str);
    }
}
