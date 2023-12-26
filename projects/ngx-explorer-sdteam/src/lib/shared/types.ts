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
    defaultViewType:string;
    autoRefreshInterval: number;
}
