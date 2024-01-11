import { TreeModel } from './../shared/types';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, concat, defer, forkJoin, lastValueFrom, of, throwError } from 'rxjs';
import { catchError, tap, toArray } from 'rxjs/operators';
import { INode, Dictionary, NodeContent, ProgressBarModel } from '../shared/types';
import { Utils } from '../shared/utils';
import { DataService } from './data.service';
import { DefaultConfig } from '../shared/default-config';
import { Clipboard } from '@angular/cdk/clipboard';

@Injectable({
    providedIn: 'root'
})
export class ExplorerService {
    private internalTree = Utils.createNode();
    private flatPointers: Dictionary<INode> = { [this.internalTree.id]: this.internalTree };
    public count = 0;
    public percent = 0;
    public total = 0;

    private readonly selectedNodes$ = new BehaviorSubject<INode[]>([]);
    private readonly openedNode$ = new BehaviorSubject<INode>(undefined);
    private readonly breadcrumbs$ = new BehaviorSubject<INode[]>([]);
    private readonly treeView$ = new BehaviorSubject<TreeModel>({ node: this.internalTree });
    private readonly uploadProgressBar$ = new BehaviorSubject<ProgressBarModel>(undefined);

    public readonly selectedNodes = this.selectedNodes$.asObservable();
    public readonly openedNode = this.openedNode$.asObservable();
    public readonly breadcrumbs = this.breadcrumbs$.asObservable();
    public readonly treeView = this.treeView$.asObservable();
    public readonly uploadProgressBar = this.uploadProgressBar$.asObservable();

    private sub: Subscription;

    constructor(
        private dataService: DataService,
        public config: DefaultConfig,
        private clipboard: Clipboard
    ) {
        if (this.config.globalOptions.autoRefresh) {
            setInterval(() => {
                this.refresh();
            }, this.config.globalOptions.autoRefreshInterval);
        }
    }
    public filterItems(pathArray: string[]) {
        return defer(async () => {
            if (pathArray.length == 0)
                return
            await this.openNode(1)
            let path = ''
            for (let val of pathArray) {
                path = path ? `${path}/${val}` : val
                const flat = Object.values(this.flatPointers)
                let flatModel = flat.find(x => x.data != undefined && x.data.name == val && x.data.path == path)
                if (flatModel == undefined)
                    break
                let flatInx = flatModel.id
                await this.openNode(flatInx)
            }
            return;
        })
    }
    public selectNodes(nodes: INode[]) {
        this.selectedNodes$.next(nodes);
    }
    public async openNode(id: number) {
        return await lastValueFrom(
            this.getNodeChildren(id)
                .pipe(tap(response => {
                    if (response) {
                        const parent = this.flatPointers[id];
                        this.openedNode$.next(parent);
                        const breadcrumbs = Utils.buildBreadcrumbs(this.flatPointers, parent);
                        this.breadcrumbs$.next(breadcrumbs);
                        this.selectedNodes$.next([]);
                    }
                }))
        )
    }

    public createNode(name: string) {
        const parent = this.openedNode$.value;
        this.dataService.createNode(parent.data, name).subscribe(() => {
            this.refresh();
        });
    }

    public refresh() {
        if (this.openedNode$.value != undefined)
            this.openNode(this.openedNode$.value.id);
        else
            this.openNode(this.internalTree.id);
    }
    public copyToClipboard(): boolean {
        try {
            const folder = this.breadcrumbs$.value.map(x => x.data?.name ?? '').join('/');
            const file = this.selectedNodes$.value[0].data.name;
            const path = `${this.config.globalOptions.homeNodeName}${folder}/${file}`
            window.isSecureContext && navigator.clipboard ? navigator.clipboard.writeText(path) : this.clipboard.copy(path)
            return true
        }
        catch (err) {
            return false
        }
    }
    public shareToClipboard(): boolean {
        try {
            const folder = this.breadcrumbs$.value.map(x => x.data?.name ?? '').join('/');
            const file = this.selectedNodes$.value[0].data.name;
            const path = `${this.config.globalOptions.homeNodeName}${folder}/${file}`
            let url: string = ''
            this.dataService
                .getBaseUrl()
                .subscribe({
                    next: (res) => {
                        url = `${res}${encodeURIComponent(path)}`
                    }
                });
            window.isSecureContext && navigator.clipboard ? navigator.clipboard.writeText(url) : this.clipboard.copy(url)
            return true
        }
        catch (err) {
            return false
        }
    }
    public getFilterStringFromSPA() {
        return new Observable((observer: any) => {
            this.dataService
                .getFilterString()
                .subscribe({
                    next: (res) => {
                        observer.next(res)
                        observer.complete()
                    },
                    error: () => {
                        observer.error({})
                        observer.complete()
                    }
                })
        })
    }
    public rename(name: string) {
        const nodes = this.selectedNodes$.value;
        if (nodes.length > 1) {
            throw new Error('Multiple selection rename not supported');
        }
        if (nodes.length === 0) {
            throw new Error('Nothing selected to rename');
        }

        const node = nodes[0];
        if (!node.isFolder) {
            this.dataService.renameLeaf(node.data, name).subscribe(() => {
                this.refresh();
            });
        } else {
            this.dataService.renameNode(node.data, name).subscribe(() => {
                this.refresh();
            });
        }
    }

    public remove() {
        const selection = this.selectedNodes$.value;
        if (selection.length === 0) {
            throw new Error('Nothing selected to remove');
        }

        const targets = selection.map(node => this.flatPointers[node.id]);
        const nodes = targets.filter(t => t.isFolder).map(data => data.data);
        const leafs = targets.filter(t => !t.isFolder).map(data => data.data);

        const sub1 = nodes.length ? this.dataService.deleteNodes(nodes) : of({});
        const sub2 = leafs.length ? this.dataService.deleteLeafs(leafs) : of({});
        forkJoin({ sub1, sub2 }).subscribe(() => {
            this.refresh();
        });
    }

    public async upload(files: FileList) {
        const node = this.openedNode$.value;
        const fileList: File[] = Array.from(files);
        this.count = 0;
        this.percent = 0;
        this.total = fileList.length + 1;
        await this.updateModalUpload('upload', false, true)
        const observableList: Array<Observable<any>> = fileList.map((item) => {
            return this.dataService.uploadFiles(node.data, item)
        });
        const strategy3 = concat(...observableList);
        this.sub = strategy3
            .pipe(
                tap({
                    next: async () => {
                        await this.updateModalUpload('uploading', false, true,)
                    },
                    error: async () => {
                        await this.updateModalUpload('uploading', false, false)
                    },
                }),
                catchError(
                    (error): Observable<any> => {
                        if (error.status === 404)
                            return of(null);
                        return throwError(() => error);
                    },
                ), toArray())
            .subscribe({
                next: async () => {
                    this.refresh();
                    await this.updateModalUpload('success', true)

                },
                error: async () => {
                    this.refresh();
                    await this.updateModalUpload('failure', true)
                }
            });
    }
    private updateModalUpload(status: string, isFinished: boolean, isSuccess?: boolean,) {
        if (isFinished) {
            const modalData = <ProgressBarModel>{
                template_Type: 'upload',
                upload_Status: status
            }
            return new Promise((resolve, _reject) => {
                this.setModal(modalData)
                setTimeout(() => {
                    resolve(true)
                }, 2000)
            })
        }
        else {
            if (isSuccess) {
                this.count++;
                this.percent = this.total > 0 ? Math.round((this.count / this.total) * 100) : 0;
            }
            else
                this.percent = 100
            const modalData = <ProgressBarModel>{
                template_Type: 'upload',
                progress_Bar_Value: this.percent,
                upload_Status: status
            }
            return new Promise((resolve, _reject) => {
                this.setModal(modalData)
                resolve(true)
            })
        }
    }
    public download() {
        const selection = this.selectedNodes$.value;
        if (selection.length === 0) {
            throw new Error('Nothing selected to remove');
        }
        const targets = selection.map(node => this.flatPointers[node.id]);
        const leafs = targets.filter(t => !t.isFolder).map(data => data.data);
        this.dataService.download(leafs).subscribe(() => { });
    }

    private getNodeChildren(id: number): Observable<any> {
        const parent = this.flatPointers[id];
        if (!parent.isFolder) {
            throw new Error('Cannot open leaf node');
        }
        return new Observable((observer: any) => {
            this.dataService
                .getNodeChildren(parent.data)
                .pipe(
                    tap(({ leafs, nodes }: NodeContent<any>) => {
                        const newNodes = nodes.map(data => Utils.createNode(id, true, data));
                        const newLeafs = leafs.map(data => Utils.createNode(id, false, data));
                        const newChildren = newNodes.concat(newLeafs);
                        const added = newChildren.filter(c => !parent.children.find(o => Utils.compareObjects(o.data, c.data)));
                        const removed = parent.children.filter(o => !newChildren.find(c => Utils.compareObjects(o.data, c.data)));
                        removed.forEach(c => {
                            const index = parent.children.findIndex(o => o.id === c.id);
                            parent.children.splice(index, 1);
                            delete this.flatPointers[c.id];
                        });
                        added.forEach(c => {
                            parent.children.push(c);
                            this.flatPointers[c.id] = c;
                        });
                        parent.children.sort((a, b) => a.data.name.localeCompare(b.data.name));
                        const nodeChildren = parent.children.filter(c => c.isFolder);
                        const leafChildren = parent.children.filter(c => !c.isFolder);
                        parent.children = nodeChildren.concat(leafChildren);
                        this.treeView$.next({ node: this.internalTree, node_Id: id });
                    }), toArray())
                .subscribe({
                    next: async (res) => {
                        observer.next(res)
                        observer.complete()
                    },
                    error: async () => {
                        observer.error({})
                        observer.complete()
                    }
                });
        })
    }
    public setModal(modal: ProgressBarModel) {
        this.uploadProgressBar$.next(modal)
    }
}
