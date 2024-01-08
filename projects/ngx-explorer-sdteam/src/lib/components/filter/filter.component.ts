import { Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, } from 'rxjs';
import { FILTER_STRING } from '../../injection-tokens/tokens';
import { ExplorerService } from '../../services/explorer.service';
import { DefaultConfig } from '../../shared/default-config';
import { BaseView } from '../../directives/base-view.directive';
import { HelperService } from '../../services/helper.service';
import { BsModalService } from 'ngx-bootstrap/modal';

@Component({
    selector: 'nxe-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss']
})
export class FilterComponent extends BaseView implements OnDestroy {
    @ViewChild('input') input: ElementRef<HTMLInputElement>;
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
