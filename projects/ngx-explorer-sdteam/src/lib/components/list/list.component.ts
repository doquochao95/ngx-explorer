import { AfterViewInit, ChangeDetectorRef, Component, Inject, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FILTER_STRING } from '../../injection-tokens/tokens';
import { ExplorerService } from '../../services/explorer.service';
import { HelperService } from '../../services/helper.service';
import { BaseView } from '../../directives/base-view.directive';
import { FileTypeIconClass } from '../../shared/types';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DefaultConfig } from '../../shared/default-config';

@Component({
    selector: 'nxe-list',
    templateUrl: './list.component.html',
    styleUrls: ['./list.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class ListComponent extends BaseView {

    icon = FileTypeIconClass.Folder
    constructor(
        explorerService: ExplorerService,
        helperService: HelperService,
        modalService: BsModalService,
        config: DefaultConfig,
        @Inject(FILTER_STRING) filterString: BehaviorSubject<string>
    ) {
        super(explorerService, helperService, modalService, config, filterString);
    }
}
