import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subscription, concat, forkJoin, of, throwError } from 'rxjs';
import { catchError, tap, toArray, filter } from 'rxjs/operators';
import { INode, Dictionary, NodeContent } from '../shared/types';
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
    private readonly tree$ = new BehaviorSubject<INode>(this.internalTree);
    private readonly progressBar$ = new BehaviorSubject<number>(0);
    private readonly uploadStatus$ = new BehaviorSubject<string>(undefined);



    public readonly selectedNodes = this.selectedNodes$.asObservable();
    public readonly openedNode = this.openedNode$.asObservable();
    public readonly breadcrumbs = this.breadcrumbs$.asObservable();
    public readonly tree = this.tree$.asObservable();
    public readonly progressBar = this.progressBar$.asObservable();
    public readonly uploadStatus = this.uploadStatus$.asObservable();


    private sub: Subscription;

    constructor(
        private dataService: DataService,
        public config: DefaultConfig,
        private clipboard: Clipboard
    ) {
        this.openNode(this.internalTree.id);
        if (this.config.globalOptions.autoRefresh) {
            setInterval(() => {
                this.refresh();
            }, this.config.globalOptions.autoRefreshInterval);
        }
    }
    public filterItems(pathArray: string[]) {
        this.openNode(1, true)
        pathArray.forEach((val) => {
            const flat = Object.values(this.flatPointers)
            let flatInx = flat.find(x => x.data != undefined && x.data.name == val).id
            console.log(flatInx)
            this.openNode(flatInx, true)
        })
    }
    public selectNodes(nodes: INode[]) {
        this.selectedNodes$.next(nodes);
    }
    public openNode(id: number, isFilter?: boolean) {
        this.getNodeChildren(id, isFilter).subscribe(() => {
            const parent = this.flatPointers[id];
            this.openedNode$.next(parent);
            const breadcrumbs = Utils.buildBreadcrumbs(this.flatPointers, parent);
            this.breadcrumbs$.next(breadcrumbs);
            this.selectedNodes$.next([]);
        });
    }
    public setUploadStatus(status: string) {
        return new Promise((resolve, _reject) => {
            this.uploadStatus$.next(status);
            setTimeout(() => {
                resolve(true)
            }, 2000)
        })
    }
    public expandNode(id: number) {
        this.getNodeChildren(id).subscribe();
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
        this.updateProgressMeter(true)
        await this.setUploadStatus('upload')
        const observableList: Array<Observable<any>> = fileList.map((item) => {
            return this.dataService.uploadFiles(node.data, item)
        });
        const strategy3 = concat(...observableList);
        this.sub = strategy3
            .pipe(
                tap({
                    next: () => {
                        this.updateProgressMeter(true)
                    },
                    error: () => {
                        this.updateProgressMeter(false)
                    },
                }),
                catchError(
                    (error): Observable<any> => {
                        if (error.status === 404) {
                            return of(null);
                        }
                        return throwError(() => error);
                    },
                ), toArray())
            .subscribe({
                next: async () => {
                    this.refresh();
                    await this.setUploadStatus('success');
                },
                error: async () => {
                    this.refresh();
                    await this.setUploadStatus('failure');
                }
            });
    }
    private updateProgressMeter(isSuccess: boolean) {
        if (isSuccess) {
            this.count++;
            this.percent = this.total > 0 ? Math.round((this.count / this.total) * 100) : 0;
        }
        else
            this.percent = 100
        this.setProgressBar()
    }
    public download() {
        const selection = this.selectedNodes$.value;
        if (selection.length === 0) {
            throw new Error('Nothing selected to remove');
        }
        const targets = selection.map(node => this.flatPointers[node.id]);
        const leafs = targets.filter(t => !t.isFolder).map(data => data.data);
        this.dataService.download(leafs).subscribe(() => {
            this.refresh();
        });
    }

    private getNodeChildren(id: number, isFilter?: boolean) {
        const parent = this.flatPointers[id];
        if (!parent.isFolder) {
            throw new Error('Cannot open leaf node');
        }

        return this.dataService
            .getNodeChildren(parent.data)
            .pipe(tap(({ leafs, nodes }: NodeContent<any>) => {
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

                parent.children.sort((a, b) => a.data.name.localeCompare(b.data.name) && a.isFolder === b.isFolder ? 0 : a.isFolder ? -1 : 1);
                const nodeChildren = parent.children.filter(c => c.isFolder);
                const leafChildren = parent.children.filter(c => !c.isFolder);
                parent.children = nodeChildren.concat(leafChildren);
                if (!isFilter)
                    this.tree$.next(this.internalTree);
            }));
    }
    public setProgressBar() {
        this.progressBar$.next(this.percent)
    }
}
