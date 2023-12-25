import { Directive, Inject, OnDestroy } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FileTypeIconClass, INode } from '../../shared/types';
import { FILTER_STRING } from '../../injection-tokens/tokens';
import { ExplorerService } from '../../services/explorer.service';
import { HelperService } from '../../services/helper.service';

@Directive()
export class BaseView implements OnDestroy {
    public selection: INode[] = [];
    public items: INode[] = [];
    public dragging = false;
    protected subs = new Subscription();
    pdfFormat: string = 'pdf'
    wordFormat: string = 'doc, docx'
    excelFormat: string = 'xlsx, xlsm, xls, xltx, xltm'
    powerpointFormat: string = 'pptx, pptm, ppt'
    imageFormat: string = 'jpg, jpeg, png'
    archiveFormat: string = 'zip, rar'
    videoFormat: string = 'mp4, wmv, flv, avi, mov'

    constructor(protected explorerService: ExplorerService, protected helperService: HelperService, @Inject(FILTER_STRING) private filter: BehaviorSubject<string>) {
        this.subs.add(this.explorerService.openedNode.subscribe(nodes => {
            this.items = nodes ? nodes.children : [];
        }));

        this.subs.add(this.explorerService.selectedNodes.subscribe(nodes => {
            this.selection = nodes ? nodes : [];
        }));
    }

    get filteredItems(): INode[] {
        const filter = this.filter.value;
        if (!filter)
            return this.items;
        if (filter.includes('/')) {
            let filterArray = filter.split('/')
            let name = filterArray[filterArray.length - 1]
            const paths = filterArray.slice(1, filterArray.length - 1)
            this.explorerService.filterItems(paths)
            return this.items.filter(i => i.data?.name.toLowerCase() == name.toLowerCase());
        }
        else {
            return this.items.filter(i => i.data?.name.toLowerCase().includes(filter.toLowerCase()));
        }
    }
    getIconClass(data: any) {
        let format: string = this.helperService.getFormat(data);
        if (this.pdfFormat.includes(format))
            return FileTypeIconClass.Pdf
        if (this.wordFormat.includes(format))
            return FileTypeIconClass.Word
        if (this.excelFormat.includes(format))
            return FileTypeIconClass.Excel
        if (this.powerpointFormat.includes(format))
            return FileTypeIconClass.Powerpoint
        if (this.imageFormat.includes(format))
            return FileTypeIconClass.Image
        if (this.archiveFormat.includes(format))
            return FileTypeIconClass.Archive
        if (this.videoFormat.includes(format))
            return FileTypeIconClass.Video
        return FileTypeIconClass.Document
    }
    select(event: MouseEvent, item: INode) {
        const selectedIndex = this.selection.findIndex(i => i === item);
        const alreadySelected = selectedIndex !== -1;
        const metaKeyPressed = event.metaKey || event.ctrlKey || event.shiftKey;

        if (alreadySelected && metaKeyPressed) {
            this.selection.splice(selectedIndex, 1);
        } else {
            if (!metaKeyPressed) {
                this.selection.length = 0;
            }
            this.selection.push(item);
        }
        this.explorerService.selectNodes(this.selection);
    }

    open(event: MouseEvent, item: INode) {
        if (item.isFolder) {
            const metaKeyPressed = event.metaKey || event.ctrlKey || event.shiftKey;
            if (!metaKeyPressed) {
                this.explorerService.openNode(item.id);
            }
        }
    }

    isSelected(item: INode) {
        return this.selection.indexOf(item) !== -1;
    }

    emptySpaceClick(): void {
        this.explorerService.selectNodes([]);
    }

    ngOnDestroy() {
        this.subs.unsubscribe();
    }

}
