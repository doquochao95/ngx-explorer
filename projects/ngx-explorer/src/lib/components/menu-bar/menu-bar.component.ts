import { Component, ElementRef, OnDestroy, TemplateRef, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { ExplorerService } from '../../services/explorer.service';
import { DefaultConfig } from '../../shared/default-config';
import { BsModalRef, BsModalService } from 'ngx-bootstrap/modal';
import { ConfirmComponent } from '../confirm/confirm.component';
import { INode } from '../../shared/types';
import { Toast } from 'bootstrap';

@Component({
    selector: 'nxe-menu-bar',
    templateUrl: './menu-bar.component.html',
    styleUrls: ['./menu-bar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MenuBarComponent implements OnDestroy {
    @ViewChild('uploader', { static: true }) uploader: ElementRef;

    modalRef?: BsModalRef;
    canUpload = false;
    canDownload = false;
    canDelete = false;
    canRename = false;
    canCreate = false;
    canCopyPath = false;


    modalTitle: string = 'Enter folder name'
    currentState: string = 'Create'

    name: string = ''
    format: string = null
    private sub = new Subscription();
    selection: INode[] = [];
    recentFolder: INode[] = [];
    recentFile: INode[] = [];
    regexName: RegExp = /\([0-9]*\)/g
    constructor(
        private explorerService: ExplorerService,
        public config: DefaultConfig,
        private modalService: BsModalService
    ) {
        this.sub.add(this.explorerService.selectedNodes.subscribe(n => {
            this.selection = n;
            this.canDownload = n.length > 0 && n.every(x => !x.isFolder);
            this.canDelete = n.length > 0 && !config.globalOptions.readOnly;
            this.canRename = n.length === 1 && !config.globalOptions.readOnly;
            this.canCreate = !config.globalOptions.readOnly
            this.canUpload = !config.globalOptions.readOnly
            this.canCopyPath = n.length === 1 && !config.globalOptions.readOnly && n.every(x => !x.isFolder);
        }));
        this.sub.add(this.explorerService.openedNode.subscribe(n => {
            this.recentFolder = n ? n.children.filter(x => x.isFolder) : [];
            this.recentFile = n ? n.children.filter(x => !x.isFolder) : [];
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
    copyPath(){
        this.explorerService.copyPath()
        this.showCopyToast()
    }
    ngOnDestroy() {
        this.sub.unsubscribe();
    }

    openModal(template: TemplateRef<any>, isRename?: boolean) {
        if (isRename) {
            if (this.selection[0].data.isFolder) {
                this.modalTitle = 'Enter new folder name'
                this.currentState = 'Rename'
                this.name = this.selection[0].data.name;
                this.format = null
            }
            else {
                this.modalTitle = 'Enter new file name'
                this.currentState = 'Rename'
                let temp: string[] = this.selection[0].data.name.split('.');
                this.name = temp.splice(0, temp.length - 1).join('.')
                this.format = '.' + temp[0]
            }
        }
        else {
            this.modalTitle = 'Enter folder name'
            this.currentState = 'Create'
            for (let i = 1; i <= 100; i++) {
                let tempName = `New folder (${i})`
                if (!this.recentFolder.some(x => x.data.name == tempName)) {
                    this.name = tempName
                    break
                }
            }
            this.format = null
        }
        this.modalRef = this.modalService.show(template, { class: 'modal-md modal-dialog-centered' });
    }

    confirm(): void {
        //Create
        if (this.currentState == 'Create') {
            if (this.recentFolder.some(x => x.data.name == this.name.trim())) {
                for (let i = 1; i <= 100; i++) {
                    let tempName = `${this.name.trim()} (${i})`
                    if (!this.recentFolder.some(x => x.data.name == tempName)) {
                        this.name = tempName
                        break
                    }
                }
            }
            this.explorerService.createNode(this.name.trim())
        }
        //Rename
        else {
            //File
            if (this.format != null) {
                if (this.recentFile.filter(x => x.id != this.selection[0].id).some(x => x.data.name == this.name.trim() + this.format.trim())) {
                    for (let i = 1; i <= 100; i++) {
                        let tempName = `${this.name.trim()} (${i})`
                        if (!this.recentFile.filter(x => x.id != this.selection[0].id).some(x => x.data.name == tempName + this.format.trim())) {
                            this.name = tempName
                            break
                        }
                    }
                }
                this.explorerService.rename(this.name.trim() + this.format.trim())
            }
            //Folder
            else {
                if (this.recentFolder.filter(x => x.id != this.selection[0].id).some(x => x.data.name == this.name.trim())) {
                    for (let i = 1; i <= 100; i++) {
                        let tempName = `${this.name.trim()} (${i})`
                        if (!this.recentFolder.filter(x => x.id != this.selection[0].id).some(x => x.data.name == tempName)) {
                            this.name = tempName
                            break
                        }
                    }
                }
                this.explorerService.rename(this.name.trim());
            }
        }
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
    goHome() {
        this.explorerService.openNode(1)
    }
    showCopyToast() {
        const toasts: any[] = Array.from(document.querySelectorAll('.toast')).map(toastNode => new Toast(toastNode))
        toasts.forEach((item) => { item.show(); })
    }
}
