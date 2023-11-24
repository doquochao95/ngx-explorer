import { Observable } from 'rxjs';

export type NodeContent<T> = { leafs: T[], nodes: T[] };

export interface Dictionary<T> {
    [Key: string]: T;
}

export interface INode {
    id: number;
    parentId: number;
    data: any;
    isLeaf: boolean;
    children: INode[];
}

export interface IDataService<T> {
    getNodeChildren(node: T): Observable<NodeContent<T>>;
    createNode(parentNode: T, name: string): Observable<any>;
    renameNode(node: T, newName: string): Observable<any>;
    renameLeaf(node: T, newName: string): Observable<any>;
    deleteNodes(nodes: T[]): Observable<any>;
    deleteLeafs(nodes: T[]): Observable<any>;
    uploadFiles(node: T, files: FileList): Observable<any>;
    download(node: T): Observable<any>;
}

export interface IHelperService {
    getName<T>(data: T): string;
}

export enum AvialableView {
    List = 'List',
    Icon = 'Icon',
}
export enum FileTypeIconClass {
    Pdf = 'icon-file-pdf',
    Word = 'icon-file-word',
    Excel = 'icon-file-excel',
    Powerpoint = 'icon-file-powerpoint',
    Image = 'icon-file-image',
    Archive = 'icon-file-archive',
    Video = 'icon-file-video',
    Document = 'icon-doc'
}
export interface NgeExplorerConfig {
    homeNodeName: string;
    autoRefresh: boolean;
    autoRefreshInterval: number;
}
