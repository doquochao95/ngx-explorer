import { Component, ElementRef, OnDestroy, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { ExplorerService } from '../../services/explorer.service';
import { DefaultConfig } from '../../shared/default-config';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmComponent } from '../confirm/confirm.component';

@Component({
    selector: 'nxe-menu-bar',
    templateUrl: './menu-bar.component.html',
    styleUrls: ['./menu-bar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MenuBarComponent implements OnDestroy {
    @ViewChild('uploader', { static: true }) uploader: ElementRef;

    modalRef?: BsModalRef;
    canUpload = true;
    canDownload = false;
    canDelete = false;
    canRename = false;
    modalTitle: string = 'Enter folder name'
    currentState: string = 'Create'
    itemType: string = 'Folder'

    private sub = new Subscription();

    constructor(
        private explorerService: ExplorerService,
        public config: DefaultConfig,
        private modalService: BsModalService
    ) {
        this.sub.add(this.explorerService.selectedNodes.subscribe(n => {
            this.canDownload = n.length > 0 && n.every(x => x.isLeaf);
            this.canDelete = n.length > 0;
            this.canRename = n.length === 1;
            if (config.globalOptions.readOnly) {
                this.canUpload = false
                this.canDelete = false
                this.canRename = false
            }
        }));
    }

    refresh() {
        this.explorerService.refresh();
    }

    openUploader() {
        this.uploader.nativeElement.click();
    }

    handleFiles(event: Event) {
        const files: FileList = (event.target as HTMLInputElement).files;
        if (!files || files.length === 0) {
            return;
        }
        this.explorerService.upload(files);
        this.uploader.nativeElement.value = '';
    }

    download() {
        this.explorerService.download();
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    openModal(template: TemplateRef<any>, isRename?: boolean) {
        this.modalTitle = isRename ? 'Enter new folder name' : 'Enter folder name'
        this.currentState = isRename ? 'Rename' : 'Create'
        this.modalRef = this.modalService.show(template, { class: 'modal-md modal-dialog-centered' });
    }

    confirm(value: string): void {
        this.currentState == 'Create' ? this.explorerService.createNode(value.trim()) : this.explorerService.rename(value.trim());
        this.modalRef?.hide();
    }

    cancel(): void {
        this.modalRef?.hide();
    }
    onChange() {
    }
    openConfirmDialog() {
        this.modalRef = this.modalService.show(ConfirmComponent, { initialState: { message: 'Are you sure you want to delete the selected files?' }, class: 'modal-dialog-centered' });
        this.modalRef.content.onClose.subscribe((result: boolean) => {
            if (result)
                this.explorerService.remove();
        })
    }
}
