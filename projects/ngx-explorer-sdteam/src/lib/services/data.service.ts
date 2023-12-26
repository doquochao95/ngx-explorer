import { Injectable } from '@angular/core';
import { IDataService } from '../shared/types';
import { Observable } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export abstract class DataService implements IDataService<any> {
    abstract getNodeChildren(node: any): Observable<any>;
    abstract createNode(parentNode: any, name: any): Observable<any>;
    abstract renameNode(node: any, newName: string): Observable<any>;
    abstract renameLeaf(node: any, newName: string): Observable<any>;
    abstract deleteNodes(nodes: any[]): Observable<any>;
    abstract deleteLeafs(nodes: any[]): Observable<any>;
    abstract uploadFiles(node: any, file: File): Observable<any>;
    abstract download(node: any[]): Observable<any>;
    // move(from to) // TODO: on/off in settings
    // copyPaste(from to) // TODO: on/off in settings
    // cutPaste(from to) // TODO: on/off in settings
}
