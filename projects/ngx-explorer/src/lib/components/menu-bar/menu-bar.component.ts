import { Component, ElementRef, OnDestroy, ViewChild, ViewEncapsulation } from '@angular/core';
import { Subscription } from 'rxjs';
import { INode } from '../../shared/types';
import { ExplorerService } from '../../services/explorer.service';
import { HelperService } from '../../services/helper.service';
import { DefaultConfig } from '../../shared/default-config';

@Component({
    selector: 'nxe-menu-bar',
    templateUrl: './menu-bar.component.html',
    styleUrls: ['./menu-bar.component.scss'],
    encapsulation: ViewEncapsulation.None
})
export class MenuBarComponent implements OnDestroy {
    @ViewChild('uploader', { static: true }) uploader: ElementRef;

    canUpload = true;
    canDownload = false;
    canDelete = false;
    canRename = false;

    private sub = new Subscription();
    private selection: INode[] = [];

    constructor(
        private explorerService: ExplorerService,
        public config: DefaultConfig) {
        this.sub.add(this.explorerService.selectedNodes.subscribe(n => {
            this.selection = n;
            this.canDownload = n.filter(x => x.isLeaf).length === 1;
            this.canDelete = n.length > 0;
            this.canRename = n.length === 1;
            if (config.globalOptions.readOnly) {
                this.canUpload = false
                this.canDelete = false
                this.canRename = false
            }
        }));
    }

    createFolder() {
        const name = prompt('Enter new folder name');
        if (name) {
            this.explorerService.createNode(name);
        }
    }

    refresh() {
        this.explorerService.refresh();
    }

    rename() {
        if (this.selection.length === 1) {
            const oldName = this.selection[0].data?.name;
            const newName = prompt('Enter new name', oldName);
            if (newName) {
                this.explorerService.rename(newName);
            }
        }
    }

    remove() {
        if (confirm('Are you sure you want to delete the selected files?')) {
            this.explorerService.remove();
        }
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

}
