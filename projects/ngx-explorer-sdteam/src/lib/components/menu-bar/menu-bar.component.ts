import { BsModalService } from 'ngx-bootstrap/modal';
import { AfterViewInit, Component, ElementRef, Inject, OnDestroy, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription, BehaviorSubject } from 'rxjs';
import { ExplorerService } from '../../services/explorer.service';
import { DefaultConfig } from '../../shared/default-config';

import { INode, ModalDataModel } from '../../shared/types';
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
    @ViewChild('uploader', { static: true }) uploader: ElementRef;
    @ViewChild('upload') upload: TemplateRef<any>;
    @ViewChild('modify') modify: TemplateRef<any>;

    constructor(
        explorerService: ExplorerService,
        helperService: HelperService,
        modalService: BsModalService,
        config: DefaultConfig,
        @Inject(FILTER_STRING) filter: BehaviorSubject<string>
    ) {
        super(explorerService, helperService, modalService, config, filter);
    }
    ngDoCheck(): void {
        const modalUpload = <ModalDataModel>{
            template_Type: 'upload',
            template: this.upload
        }
        const modalModify = <ModalDataModel>{
            template_Type: 'modify',
            template: this.modify
        }
        this.explorerService.setModal(modalUpload)
        this.explorerService.setModal(modalModify)
        this.explorerService.setUploader(this.uploader)
    }
}
