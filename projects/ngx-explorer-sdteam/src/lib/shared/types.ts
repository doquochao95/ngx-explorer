import { TemplateRef } from '@angular/core';
import { ContextMenu } from './context-menu';
import { Observable } from 'rxjs';

export type NodeContent<T> = { leafs: T[], nodes: T[] };
export type NgExplorerOption = Partial<ExplorerOption>;

export interface Dictionary<T> {
    [Key: string]: T;
}

export interface INode {
    id: number;
    parentId: number;
    data: ItemModel;
    isFolder: boolean;
    children: INode[];
}
export interface ItemModel {
    id: number;
    name: string;
    path: string;
    content?: string
    url?: string
    type: string;
    size: number | null;
    last_Modified: Date;
    isFolder: boolean;
}
export interface ExampleNode {
    name: string;
    path: string;
    content?: string;
    id: number | string;
}
export interface IDataService<T> {
    getNodeChildren(node: T): Observable<NodeContent<T>>;
    createNode(parentNode: T, name: string): Observable<any>;
    renameNode(node: T, newName: string): Observable<any>;
    renameLeaf(node: T, newName: string): Observable<any>;
    deleteNodes(nodes: T[]): Observable<any>;
    deleteLeafs(nodes: T[]): Observable<any>;
    uploadFiles(node: T, file: File): Observable<any>;
    download(node: T[]): Observable<any>;
    getBaseUrl(): Observable<any>;
    getFilterString(): Observable<any>;
}

export interface IHelperService {
    getFormat(data: any): string
}
export enum FileTypeIconClass {
    Folder = 'icon-folder',
    Pdf = 'icon-file-pdf',
    Word = 'icon-file-word',
    Excel = 'icon-file-excel',
    Powerpoint = 'icon-file-powerpoint',
    Image = 'icon-file-image',
    Archive = 'icon-file-archive',
    Video = 'icon-file-video',
    Document = 'icon-doc'
}

export interface ExplorerOption {
    homeNodeName: string;
    autoRefresh: boolean;
    readOnly: boolean;
    defaultViewType: string;
    autoRefreshInterval: number;
    offSetTop: number;
    offSetRight: number;
    offSetBottom: number;
    offSetLeft: number;
}
export interface ContextMenuOption {
    isVisibled: boolean;
    elements: ContextMenu[];
}
export interface ModalTemplateOption {
    type: string;
    template: TemplateRef<any>
}
export interface ModalDataModel {
    template_Type: string;
    template: TemplateRef<any> | null
    progress_Bar_Value: number | null;
    upload_Status: string | null;
}
export interface ToastModel {
    toastBody: string;
    toastIcon: string
}

export interface TreeNode extends INode {
    children: TreeNode[];
    expanded: boolean;
}
export interface TreeModel {
    node : INode;
    node_Id? : number
}
