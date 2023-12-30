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
export class MenuBarComponent extends BaseView implements OnDestroy, AfterViewInit {
    @ViewChild('uploader', { static: true }) uploader: ElementRef;
    @ViewChild('upload') upload: TemplateRef<any>;
    @ViewChild('modify') modify: TemplateRef<any>;

    canUpload = false;
    canDownload = false;
    canDelete = false;
    canRename = false;
    canCreate = false;
    canCopyPath = false;
    canShare = false;

    private sub = new Subscription();
    selection: INode[] = [];

    progressValue: number = 0
    progressStatus: string = 'upload'
    constructor(
        explorerService: ExplorerService,
        helperService: HelperService,
        modalService: BsModalService,
        @Inject(FILTER_STRING) filter: BehaviorSubject<string>,
        public config: DefaultConfig,
    ) {
        super(explorerService, helperService, modalService, filter);
        this.sub.add(this.explorerService.selectedNodes.subscribe(n => {
            this.selection = n;
            this.canDownload = n.length > 0 && n.every(x => !x.isFolder);
            this.canDelete = n.length > 0 && !config.globalOptions.readOnly;
            this.canRename = n.length === 1 && !config.globalOptions.readOnly;
            this.canCreate = !config.globalOptions.readOnly
            this.canUpload = !config.globalOptions.readOnly
            this.canCopyPath = n.length === 1;
            this.canShare = n.length === 1;
        }));
        this.sub.add(this.explorerService.modalDataModel.subscribe(res => {
            if (res?.template_Type == 'upload' && res?.upload_Status) {
                this.progressValue = res?.progress_Bar_Value ?? this.progressValue;
                this.progressStatus = res?.upload_Status ?? this.progressStatus;
                switch (res?.upload_Status) {
                    case "upload":
                        this.openModalUpload()
                        break;
                    case "success":
                        this.closeModalUpload()
                        break;
                    case "failure":
                        this.closeModalUpload()
                        break;
                    default:
                }
            }
        }));
    }
    ngAfterViewInit() {
        this.explorerService.refresh()
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
    ngOnDestroy() {
        this.sub.unsubscribe();
    }
    goHome() {
        this.explorerService.openNode(1)
    }
}
