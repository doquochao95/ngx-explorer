import { DefaultConfig } from './../shared/default-config';
import { AfterViewInit, ChangeDetectorRef, Directive, ElementRef, Host, HostListener, Inject, Input, OnDestroy, Self, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { ContextMenuOption, FileTypeIconClass, INode, ModalDataModel, ToastModel, TreeNode } from '../shared/types';
import { FILTER_STRING } from '../injection-tokens/tokens';
import { ExplorerService } from '../services/explorer.service';
import { HelperService } from '../services/helper.service';
import { ContextMenu } from '../shared/context-menu';
import { BsModalRef, BsModalService, ModalOptions } from 'ngx-bootstrap/modal';
import { Utils } from '../shared/utils';
import { ConfirmComponent } from '../components/confirm/confirm.component';
import { Toast } from 'bootstrap';
import { filter } from 'rxjs/operators';

@Directive()
export class BaseView implements OnDestroy {
    @HostListener('mousedown', ['$event'])
    public mousedown(event: MouseEvent): void {
        if (event.ctrlKey || event.shiftKey)
            event.preventDefault();
    }
    public selection: INode[] = [];
    public items: INode[] = [];
    public dragging = false;
    public top: string = '0';
    public right: string = '0';
    public _isVisibled: boolean = false;
    public _elements: ContextMenu[] = [
        new ContextMenu("test 1", "", () => console.log('test 1')),
        new ContextMenu("test 2", "", () => console.log('test 2')),
        new ContextMenu('', "", null, null, false, false, false, true),
        new ContextMenu("Clear", "", () => console.clear())
    ];

    public modalTitle: string = 'Enter folder name'
    public modalRef?: BsModalRef;
    public name: string = ''
    public format: string = null
    public modifyType: string = 'Create'
    public toast: ToastModel = <ToastModel>{}

    public canUpload = false;
    public canDownload = false;
    public canDelete = false;
    public canRename = false;
    public canCreate = false;
    public canCopyPath = false;
    public canShare = false;

    public progressValue: number = 0
    public progressStatus: string = 'upload'

    public treeNodes: TreeNode[] = [];
    public searchPlaceHolder: string = "Search"

    private expandedIds: number[] = [];
    private recentFolder: INode[] = [];
    private recentFile: INode[] = [];
    private modalModifyTemplate: TemplateRef<any>;
    private modalUploadTemplate: TemplateRef<any>;
    private pdfFormat: string = 'pdf'
    private wordFormat: string = 'doc, docx'
    private excelFormat: string = 'xlsx, xlsm, xls, xltx, xltm'
    private powerpointFormat: string = 'pptx, pptm, ppt'
    private imageFormat: string = 'jpg, jpeg, png'
    private archiveFormat: string = 'zip, rar'
    private videoFormat: string = 'mp4, wmv, flv, avi, mov'
    private tempValue: string = ''
    private uploaderElement: ElementRef;
    private searchInputElement: ElementRef<HTMLInputElement>;
    private modalOptions: ModalOptions = {
        backdrop: 'static',
        keyboard: false,
        class: 'modal-md modal-dialog-centered'
    };
    protected subs = new Subscription();

    get visible(): boolean {
        return this._isVisibled
    }

    get elements(): ContextMenu[] {
        return this._elements
    }

    get filteredItems(): INode[] {
        const filter = this.filterString.value;
        if (!filter) {
            if (this.tempValue != filter)
                this.explorerService.refresh()
            this.tempValue = filter
        }
        if (this.tempValue != filter) {
            if (filter.includes('/')) {
                let filterArray = filter.split('/')
                const name = filterArray[filterArray.length - 1]
                const paths = filterArray.slice(1, filterArray.length - 1)
                this.explorerService.filterItems(paths).subscribe(() => {
                    // const itemPath = name.includes('.') ? filterArray.slice(1, filterArray.length - 1).join('/') : filterArray.slice(1, filterArray.length).join('/')
                    // this.items = this.items.filter(i => i.data?.name == name && i.data?.path == itemPath);
                    this.items = this.items.filter(i => i.data?.name == name);
                })
            }
            else {
                this.items = this.items.filter(i => i.data?.name.toLowerCase().includes(filter.toLowerCase()));
            }
            this.tempValue = filter
        }
        return this.items
    }

    constructor(
        protected explorerService: ExplorerService,
        protected helperService: HelperService,
        protected modalService: BsModalService,
        protected config: DefaultConfig,
        @Inject(FILTER_STRING) protected filterString: BehaviorSubject<string>
    ) {
        this.subs.add(this.helperService.emitter.subscribe((res) => {
            res == null ? this.explorerService.refresh() : this.filterString.next(res)
        }));
        this.subs.add(this.explorerService.openedNode.subscribe(nodes => {
            this.items = nodes ? nodes.children : [];
            this.recentFolder = nodes ? nodes.children.filter(x => x.isFolder) : [];
            this.recentFile = nodes ? nodes.children.filter(x => !x.isFolder) : [];
            if (nodes != undefined)
                this.searchPlaceHolder = `Search ${nodes.data != undefined ? nodes.data.name : '' || this.config.globalOptions.homeNodeName}`;
        }));
        this.subs.add(this.explorerService.selectedNodes.subscribe(nodes => {
            this.selection = nodes ? nodes : [];
            this.canDownload = nodes.length > 0 && nodes.every(x => !x.isFolder);
            this.canDelete = nodes.length > 0 && !config.globalOptions.readOnly;
            this.canRename = nodes.length === 1 && !config.globalOptions.readOnly;
            this.canCreate = !config.globalOptions.readOnly
            this.canUpload = !config.globalOptions.readOnly
            this.canCopyPath = nodes.length === 1;
            this.canShare = nodes.length === 1;
        }));
        this.subs.add(this.explorerService.contextMenu.subscribe(status => {
            this._isVisibled = status?.isVisibled
            this._elements = status?.elements
        }));
        this.subs.add(this.explorerService.toast.subscribe(toast => {
            this.toast = toast
        }));
        this.subs.add(this.explorerService.uploader.subscribe(element => {
            this.uploaderElement = element
        }));
        this.subs.add(this.explorerService.searchInput.subscribe(element => {
            this.searchInputElement = element
        }));
        this.subs.add(this.explorerService.modalDataModel.subscribe(res => {
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
            if (res?.template) {
                if (res.template_Type == 'modify')
                    this.modalModifyTemplate = res?.template
                if (res.template_Type == 'upload')
                    this.modalUploadTemplate = res?.template
            }
            if (res?.model_State == false) {
                if (res?.template_Type == 'modify')
                    this.modalRef?.hide()
                if (res?.template_Type == 'upload')
                    setTimeout(() => this.modalRef?.hide(), 2000);
            }
            if (res?.modal_Title && res?.modify_Type) {
                if (res.template_Type == 'modify') {
                    this.modalTitle = res?.modal_Title
                    this.modifyType = res?.modify_Type
                    this.name = res?.file_Name
                    this.format = res?.file_Format
                }
            }
        }));
        this.subs.add(this.explorerService.tree.pipe(filter(x => !!x)).subscribe(node => {
            this.addExpandedNode(node.id); // always expand root
            this.treeNodes = this.buildTree(node).children;
            this.clearSearchInput();
        }));
    }
    ngOnDestroy() {
        this.subs.unsubscribe();
    }
    public getIconClass(data: any) {
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
    public select(event: MouseEvent, item: INode) {
        const selectedIndex = this.selection.findIndex(i => i === item);
        const alreadySelected = selectedIndex !== -1;
        const metaCtrlKeyPressed = event.metaKey || event.ctrlKey;
        const shiftKeyPressed = event.shiftKey
        if (alreadySelected && metaCtrlKeyPressed)
            this.selection.splice(selectedIndex, 1);
        else if (shiftKeyPressed) {
            if (this.selection.length > 0) {
                const startItem = this.items.indexOf(this.selection[0])
                const endItem = this.items.indexOf(this.selection[this.selection.length - 1])
                const recentItem = this.items.indexOf(item)
                this.selection.length = 0
                startItem < recentItem
                    ? this.selection.push(...this.items.slice(startItem, recentItem + 1))
                    : this.selection.push(...this.items.slice(recentItem, endItem + 1))
            }
            else
                this.selection.push(item);
        }
        else {
            if (!metaCtrlKeyPressed)
                this.selection.length = 0;
            this.selection.push(item);
        }
        this.explorerService.selectNodes(this.selection);
    }
    public open(event: MouseEvent, item: INode) {
        if (item.isFolder) {
            const metaKeyPressed = event.metaKey || event.ctrlKey || event.shiftKey;
            if (!metaKeyPressed) {
                this.explorerService.openNode(item.id);
            }
        }
    }
    public openUploader() {
        this.uploaderElement.nativeElement.click();
    }
    public handleFiles(event: Event) {
        const files: FileList = (event.target as HTMLInputElement).files;
        if (!files || files.length === 0) {
            return;
        }
        this.explorerService.upload(files);
        this.uploaderElement.nativeElement.value = '';
    }
    public download() {
        this.explorerService.download();
    }
    public refresh() {
        this.explorerService.refresh();
    }
    public path() {
        this.showCopyToast(this.explorerService.copyToClipboard())
    }
    public link() {
        this.showCopyToast(this.explorerService.shareToClipboard())
    }
    public isSelected(item: INode) {
        return this.selection.indexOf(item) !== -1;
    }
    public emptySpaceClick(): void {
        this.explorerService.selectNodes([]);
    }
    public openContextMenu(item?: INode) {
        let menuElements: ContextMenu[] = []
        if (item != undefined) {
            if (this.selection.length <= 1) {
                this.selection.length = 0
                this.selection.push(item)
                this.explorerService.selectNodes(this.selection);
            }
            if (item.isFolder)
                menuElements = [
                    new ContextMenu("New Folder", "icon-folder-empty", () => this.openModalModify(), null, false, !this.canCreate),
                    new ContextMenu("Upload", "icon-upload", () => this.openUploader(), null, false, !this.canUpload),
                    new ContextMenu('', "", null, null, true, !this.canCreate && !this.canUpload),
                    new ContextMenu("Rename", "icon-edit", () => this.openModalModify(true), null, false, !this.canRename),
                    new ContextMenu("Delete", "icon-trash-empty", () => this.openConfirmDialog(), null, false, !this.canDelete),
                    new ContextMenu('', "", null, null, true, !this.canRename && !this.canDelete),
                    new ContextMenu("Path", "icon-share", () => this.path()),
                    new ContextMenu("Link", "icon-link", () => this.link())
                ];
            else
                menuElements = [
                    new ContextMenu("New Folder", "icon-folder-empty", () => this.openModalModify(), null, false, !this.canCreate),
                    new ContextMenu("Upload", "icon-upload", () => this.openUploader(), null, false, !this.canUpload),
                    new ContextMenu('', "", null, null, true, !this.canCreate && !this.canUpload),
                    new ContextMenu("Download", "icon-download", () => this.download()),
                    new ContextMenu("Rename", "icon-edit", () => this.openModalModify(true), null, false, !this.canRename),
                    new ContextMenu("Delete", "icon-trash-empty", () => this.openConfirmDialog(), null, false, !this.canDelete),
                    new ContextMenu('', "", null, null, true),
                    new ContextMenu("Path", "icon-share", () => this.path()),
                    new ContextMenu("Link", "icon-link", () => this.link())
                ];
        }
        else {
            if (this.canCreate && this.canUpload)
                menuElements = [
                    new ContextMenu("New Folder", "icon-folder-empty", () => this.openModalModify(), null, false, !this.canCreate),
                    new ContextMenu("Upload", "icon-upload", () => this.openUploader(), null, false, !this.canUpload),
                ];
        }
        const data: ContextMenuOption = <ContextMenuOption>{
            isVisibled: true,
            elements: menuElements
        }
        this.explorerService.setContextMenu(data)
    }
    public openModalModify(isRename?: boolean) {
        let modalData = <ModalDataModel>{}
        if (isRename) {
            if (this.selection[0].data.isFolder) {
                this.modalTitle = 'Enter new folder name'
                this.modifyType = 'Rename'
                this.name = this.selection[0].data.name;
                this.format = null
                modalData = <ModalDataModel>{
                    template_Type: 'modify',
                    modal_Title: 'Enter new folder name',
                    modify_Type: 'Rename',
                    file_Name: this.selection[0].data.name,
                    file_Format: ''
                }
            }
            else {
                let temp: string[] = this.selection[0].data.name.split('.');
                modalData = <ModalDataModel>{
                    template_Type: 'modify',
                    modal_Title: 'Enter new file name',
                    modify_Type: 'Rename',
                    file_Name: temp.splice(0, temp.length - 1).join('.'),
                    file_Format: '.' + temp[0]
                }
            }
        }
        else {
            let _fileName = ''
            for (let i = 1; i <= 100; i++) {
                let tempName = `New folder (${i})`
                if (!this.recentFolder.some(x => x.data.name == tempName)) {
                    _fileName = tempName
                    break
                }
            }
            modalData = <ModalDataModel>{
                template_Type: 'modify',
                modal_Title: 'Enter folder name',
                modify_Type: 'Create',
                file_Name: _fileName,
                file_Format: ''
            }
        }
        this.explorerService.setModal(modalData)
        this.modalRef = this.modalService.show(this.modalModifyTemplate, { class: 'modal-md modal-dialog-centered' });
    }
    public confirm(): void {
        //Create
        if (this.modifyType == 'Create') {
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
        this.cancel()
    }
    public cancel(): void {
        const modalData = <ModalDataModel>{
            template_Type: 'modify',
            model_State: false
        }
        this.explorerService.setModal(modalData)
    }
    public onNameChange(event: any) {
        return Utils.checkSpecialChar(event.key)
    }
    public openConfirmDialog() {
        this.modalRef = this.modalService.show(ConfirmComponent, { initialState: { message: 'Are you sure you want to delete the selected files?' }, class: 'modal-dialog-centered' });
        this.modalRef.content.onClose.subscribe((result: boolean) => {
            if (result)
                this.explorerService.remove();
        })
    }
    public openModalUpload() {
        this.modalRef = this.modalService.show(this.modalUploadTemplate, this.modalOptions);
    }
    public closeModalUpload() {
        const modalData = <ModalDataModel>{
            template_Type: 'upload',
            model_State: false
        }
        this.explorerService.setModal(modalData)
    };
    private showCopyToast(isSuccess: boolean) {
        let toastData: ToastModel = <ToastModel>{}
        if (isSuccess)
            toastData = <ToastModel>{
                toastBody: 'Copied Successfully',
                toastIcon: 'icon-ok'
            }
        else
            toastData = <ToastModel>{
                toastBody: 'Unable to copy to clipboard',
                toastIcon: 'icon-cancel-1'
            }
        this.explorerService.setToast(toastData)
        const toasts: any[] = Array.from(document.querySelectorAll('.toast')).map(toastNode => new Toast(toastNode))
        toasts.forEach((item) => { item.show(); })
    }
    public onTreeClick(node: TreeNode) {
        let items: number[] = []
        if (!node.expanded) {
            items = this.getAllItem(this.treeNodes)
            let sameLayerItems: INode[] = this.getSameLayerItem(node, this.treeNodes)
            sameLayerItems.map(x => {
                if (this.expandedIds.indexOf(x.id) != -1)
                    this.removeExpandedNode(x.id)
            })
            this.expandedIds = this.expandedIds.filter(x => items.indexOf(x) != -1 || x == 1)
        }
        else {
            items = this.getAllItem(node.children)
            this.expandedIds = this.expandedIds.filter(x => items.indexOf(x) == -1 || x == 1)
        }
        this.addExpandedNode(node.id);
        this.explorerService.openNode(node.id);
        this.explorerService.expandNode(node.id);
    }
    private getSameLayerItem(node: TreeNode, treeNodes: TreeNode[]): TreeNode[] {
        for (let item of treeNodes) {
            if (node.id == item.id)
                return treeNodes
            else {
                if (item.children.length > 0) {
                    let res = this.getSameLayerItem(node, item.children)
                    if (res != undefined)
                        return res
                }
            }
        }
    }
    private getAllItem(treeNodes: TreeNode[]): number[] {
        let result: number[] = []
        for (let item of treeNodes) {
            result.push(item.id)
            if (item.children.length > 0)
                result.push(...this.getAllItem(item.children))
        }
        return result
    }
    private buildTree(node: INode): TreeNode {
        const treeNode = {
            id: node.id,
            parentId: node.parentId,
            data: node.data,
            isFolder: node.isFolder,
            children: [],
            expanded: false
        } as TreeNode;

        treeNode.expanded = this.expandedIds.indexOf(node.id) > -1;
        if (treeNode.expanded) {
            treeNode.children = node.children.filter(x => x.isFolder).map(x => this.buildTree(x));
        }
        return treeNode;
    }
    private removeExpandedNode(id: number) {
        const index = this.expandedIds.indexOf(id);
        this.expandedIds.splice(index, 1);
    }
    private addExpandedNode(id: number) {
        const index = this.expandedIds.indexOf(id);
        if (index === -1) {
            this.expandedIds.push(id);
        }
    }
    public onSearchChange(e: KeyboardEvent, value: string) {
        if (e.key === 'Escape') {
            this.searchInputElement.nativeElement.value = '';
            this.filterString.next('');
            return;
        }
        this.filterString.next(value.trim());
    }
    public clearSearchInput() {
        if (!this.searchInputElement) { return; }
        this.searchInputElement.nativeElement.value = '';
        this.filterString.next('');
    }
}
