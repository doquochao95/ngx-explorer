import { Directive, EventEmitter, HostListener, Output } from '@angular/core';
import { ExplorerService } from '../services/explorer.service';

@Directive({
    selector: '[nxeDragDrop]'
})
export class DragDropDirective {
    @Output() dragEnter = new EventEmitter<any>();
    @Output() dragOver = new EventEmitter<any>();
    @Output() dragLeave = new EventEmitter<any>();
    @Output() dragDrop = new EventEmitter<any>();
    @Output() dragging = new EventEmitter<boolean>();

    constructor(private explorerService: ExplorerService) { }

    @HostListener('dragenter', ['$event'])
    public onDragEnter(event: { preventDefault: () => void; stopPropagation: () => void; }) {
        event.preventDefault();
        event.stopPropagation();
        this.dragEnter.emit(event);
        this.dragging.emit(true);

    }

    @HostListener('dragover', ['$event'])
    public onDragOver(event: { preventDefault: () => void; stopPropagation: () => void; }) {
        event.preventDefault();
        event.stopPropagation();
        this.dragOver.emit(event);
        this.dragging.emit(true);
    }

    @HostListener('dragleave', ['$event'])
    public onDragLeave(event: { preventDefault: () => void; stopPropagation: () => void; }) {
        event.preventDefault();
        event.stopPropagation();
        this.dragLeave.emit(event);
        this.dragging.emit(false);
    }

    @HostListener('drop', ['$event'])
    public onDrop(event: { preventDefault: () => void; stopPropagation: () => void; dataTransfer: { files: FileList; }; }) {
        event.preventDefault();
        event.stopPropagation();
        const files = event.dataTransfer.files as FileList;
        console.log(files);
        if (files.length > 0) {
            this.explorerService.upload(files);
            this.dragDrop.emit(files);
        }
        this.dragging.emit(false);
    }

}
