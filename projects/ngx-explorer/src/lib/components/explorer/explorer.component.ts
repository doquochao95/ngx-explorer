import { Component, Input, OnDestroy, OnInit, ViewEncapsulation, AfterContentInit, numberAttribute, booleanAttribute, ViewChild, TemplateRef } from '@angular/core';
import { Subscription } from 'rxjs';
import { DefaultConfig } from '../../shared/default-config';
import { ExplorerService } from '../../services/explorer.service';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';

function capitalizeString(input: string): string {
    return input ? input.charAt(0).toUpperCase() + input.slice(1) : input
}
@Component({
    selector: 'nxe-explorer',
    templateUrl: './explorer.component.html',
    styleUrls: ['./explorer.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class ExplorerComponent implements OnInit, AfterContentInit, OnDestroy {
    @ViewChild('upload') templateRef: TemplateRef<any>;
    progressValue: number = 0
    progressStatus: string = 'upload'

    @Input({ alias: 'read-only', transform: booleanAttribute }) readOnly: boolean
    @Input({ alias: 'auto-refresh', transform: booleanAttribute }) autoRefresh: boolean
    @Input({ alias: 'refresh-interval' }) autoRefreshInterval: number;
    @Input({ alias: 'main-node', transform: capitalizeString }) homeNodeName: string
    @Input({ alias: 'view-type', transform: capitalizeString }) defaultViewType: string
    uploading: boolean = false
    private sub = new Subscription();
    modalRef?: BsModalRef;
    modalOptions: ModalOptions = {
        backdrop: 'static',
        keyboard: false,
        class: 'modal-md modal-dialog-centered'
    };
    constructor(private explorerService: ExplorerService, public config: DefaultConfig, private modalService: BsModalService) {
        this.sub.add(this.explorerService.progressBar.subscribe(value => {
            this.progressValue = value;
        }));
        this.sub.add(this.explorerService.uploadStatus.subscribe(value => {
            if (value != undefined) {
                this.progressStatus = value
                switch (value) {
                    case "success":
                        this.closeModal()
                        break;
                    case "failure":
                        this.closeModal()
                        break;
                    default:
                        this.openModal()
                }
            }
        }));
    }

    ngOnInit() {
        if (this.readOnly != undefined)
            this.config.globalOptions.readOnly = this.readOnly
        if (this.autoRefresh != undefined)
            this.config.globalOptions.autoRefresh = this.autoRefresh
        if (this.homeNodeName != undefined)
            this.config.globalOptions.homeNodeName = this.homeNodeName
        if (this.autoRefreshInterval != undefined)
            this.config.globalOptions.autoRefreshInterval = this.autoRefreshInterval
        if (this.defaultViewType != undefined)
            this.config.globalOptions.defaultViewType = this.defaultViewType
    }
    ngOnDestroy() {
        this.sub.unsubscribe();
    }
    ngAfterContentInit() {
        this.explorerService.refresh()
    }
    openModal() {
        this.modalRef = this.modalService.show(this.templateRef, this.modalOptions);
    }
    closeModal() {
        setTimeout(() => this.modalRef?.hide(), 2000);
    };
}
