import { BsModalService } from 'ngx-bootstrap/modal';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ExplorerService } from '../../services/explorer.service';
import { DefaultConfig } from '../../shared/default-config';

import { ModalDataModel } from '../../shared/types';
import { HelperService } from '../../services/helper.service';
import { FILTER_STRING } from '../../injection-tokens/tokens';
import { BaseView } from '../../directives/base-view.directive';

@Component({
    selector: 'nxe-menu-bar',
    templateUrl: './menu-bar.component.html',
    styleUrls: ['./menu-bar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MenuBarComponent extends BaseView implements OnDestroy {
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
