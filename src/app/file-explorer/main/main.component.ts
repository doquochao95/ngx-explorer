import { ActivatedRoute } from '@angular/router';
import { ExampleNode, HelperService, IDataService, ItemModel, NodeContent } from 'ngx-explorer-sdteam';
import { Component } from '@angular/core';
import { Observable, delay, forkJoin, of } from 'rxjs';
import { AppDataService } from 'src/app/app-data.service';

@Component({
    selector: 'app-main',
    templateUrl: './main.component.html',
    styleUrls: ['./main.component.scss']
})

export class MainComponent implements IDataService<ExampleNode> {
    title = 'explorer-app';
    isCollapsed = false;
    private id = 0;
    private folderId = 20;
    MOCK_FOLDERS: ItemModel[] = []
    MOCK_FILES: ItemModel[] = []
    // memoryData: ItemModel[] = []
    base64Image: any;
    filter: string;
    baseUrl: string = `${window.location.protocol}//${window.location.hostname}:${window.location.port}/`;

    constructor(
        private service: AppDataService,
        private helperService: HelperService,
        private _activatedroute: ActivatedRoute
    ) {
        // this._activatedroute.data.subscribe((data) => { this.memoryData = data.dataResolved }).unsubscribe();
        this.MOCK_FILES = this.service.getDataFile()
        this.MOCK_FOLDERS = this.service.getDataFolder()
        this.filter = this._activatedroute.snapshot.queryParamMap.get('filter')
    }
    getFilterString(): Observable<any> {
        return of(`${this.filter}`);
    }
    getBaseUrl(): Observable<any> {
        return of(`${this.baseUrl}file-explorer?filter=`);
    }
    download(nodes: ExampleNode[]): Observable<any> {
        const results = nodes.map(node => {
            const file = this.MOCK_FILES.find(f => f.id === node.id);
            if (file.type.indexOf('image') != -1 && (file.url || !this.checkEmpty(file.url))) {
                this.service.getBase64ImageFromURL(file.url).subscribe(base64data => {
                    this.base64Image = `data:${file.type};base64,${base64data}`;
                    var link = document.createElement('a');
                    document.body.appendChild(link); // for Firefox
                    link.setAttribute("href", this.base64Image);
                    link.setAttribute("download", file.name);
                    link.click();
                });
                return of({});
            }
            else {
                let byteCharacters = atob(file.content.split(',')[1]);
                let byteArrays = [];
                for (let offset = 0; offset < byteCharacters.length; offset += 512) {
                    let slice = byteCharacters.slice(offset, offset + 512);
                    let byteNumbers = new Array(slice.length);
                    for (var i = 0; i < slice.length; i++) {
                        byteNumbers[i] = slice.charCodeAt(i);
                    }
                    let byteArray = new Uint8Array(byteNumbers);
                    byteArrays.push(byteArray);
                }
                let result = new Blob(byteArrays);
                const blob = new Blob([result]);
                const url = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = file.name;
                document.body.appendChild(link);
                link.click();
                return of({});
            }
        });
        return forkJoin(results);
    }
    // download(nodes: ExampleNode[]): Observable<any> {
    //     var ids = nodes.map(n => n.id);
    //     const source$: Observable<any> = this.downloadFile(ids);
    //     return source$
    // }
    // private downloadFile(ids: (string | number)[]): Observable<any> {
    //     return new Observable((observer: any) => {
    //         this.service.downloadFile(ids)
    //             .subscribe({
    //                 next: (result) => {
    //                     if (result.success) {
    //                         result.data.map((x: ItemModel) => {
    //                             var link = document.createElement('a');
    //                             document.body.appendChild(link);
    //                             link.setAttribute("href", x.content);
    //                             link.setAttribute("download", x.name);
    //                             link.click();
    //                             observer.next(result);
    //                         })
    //                     }
    //                     else {
    //                         observer.error(result);
    //                         this.snotifyService.error(result.message, CaptionConstants.ERROR);
    //                     }
    //                     observer.complete();
    //                 },
    //                 error: (e) => {
    //                     this.snotifyService.error(e, CaptionConstants.ERROR);
    //                     observer.error({});
    //                     observer.complete();
    //                 },
    //             });
    //     })
    // }
    uploadFiles(node: ExampleNode, file: File): Observable<any> {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        const id = ++this.id;
        reader.onload = () => {
            const nodePath = node ? this.MOCK_FOLDERS.find(f => f.id === node.id).path : '';
            const newFile: ItemModel = {
                id,
                name: file.name,
                path: nodePath,
                content: reader.result as string,
                type: file.type,
                size: file.size,
                last_Modified: new Date,
                isFolder: false
            };
            if (this.MOCK_FILES.filter(x => x.name == newFile.name && x.path == newFile.path).length == 0)
                this.MOCK_FILES.push(newFile)
        };
        return of(file).pipe(delay(this.randomDelay(100, 300)))
    }

    private randomDelay(bottom: number, top: number): number {
        return Math.floor(Math.random() * (1 + top - bottom)) + bottom;
    }
    // uploadFiles(node: ExampleNode, file: File): Observable<any> {
    //     const reader = new FileReader();
    //     reader.readAsDataURL(file);
    //     const source$: Observable<ItemModel> = this.postFile(node, file);
    //     return source$
    // }
    // private postFile(node: ExampleNode, file: File): Observable<ItemModel> {
    //     return new Observable((observer: any) => {
    //         const reader = new FileReader();
    //         const id = ++this.id;
    //         reader.onload = () => {
    //             const nodePath = node ? this.MOCK_FOLDERS.find(f => f.id === node.id).path : '';
    //             const newFile: ItemModel = {
    //                 id,
    //                 name: file.name,
    //                 path: nodePath,
    //                 content: reader.result as string,
    //                 type: file.type,
    //                 size: file.size,
    //                 last_Modified: new Date,
    //                 isFolder: false
    //             };
    //             if (newFile.size > 30000000) //limit 30 MB
    //             {
    //                 this.snotifyService.error(MessageConstants.FILE_SIZE, CaptionConstants.ERROR);
    //                 observer.error();
    //                 observer.complete();
    //             }
    //             else {
    //                 this.service.uploadFile(newFile)
    //                     .subscribe({
    //                         next: (result: OperationResult) => {
    //                             if (result.success)
    //                                 observer.next(result);
    //                             else {
    //                                 observer.error(result);
    //                                 this.snotifyService.error(result.message, CaptionConstants.ERROR);
    //                             }
    //                             observer.complete();
    //                         },
    //                         error: (e) => {
    //                             observer.error(e);
    //                             this.snotifyService.error(e, CaptionConstants.ERROR);
    //                             observer.complete();
    //                         },
    //                     });
    //             }
    //         };
    //         reader.readAsDataURL(file);
    //     });
    // }
    deleteNodes(nodes: ExampleNode[]): Observable<any> {
        const results = nodes.map(node => {
            const path = node.path + '/';
            const folder = this.MOCK_FOLDERS.filter(f => f.id === node.id || f.path.startsWith(path));
            const file = this.MOCK_FILES.filter(f => f.path.startsWith(path));
            folder.map(x => this.MOCK_FOLDERS.splice(this.MOCK_FOLDERS.indexOf(x), 1))
            file.map(x => this.MOCK_FILES.splice(this.MOCK_FILES.indexOf(x), 1))
            return of({});
        });
        return forkJoin(results);
    }
    // deleteNodes(nodes: ExampleNode[]): Observable<any> {
    //     let ids: number[] = []
    //     nodes.map(node => {
    //         const path = node.path + '/';
    //         ids.push(...this.MOCK_FOLDERS.filter(f => f.id === node.id || f.path.startsWith(path)).map(x => x.id))
    //         ids.push(...this.MOCK_FILES.filter(f => f.path.startsWith(path)).map(x => x.id))
    //     });
    //     const source$: Observable<ItemModel> = this.deleteFolder(ids);
    //     return source$
    // }
    // private deleteFolder(ids: number[]): Observable<any> {
    //     return new Observable((observer: any) => {
    //         this.service.deleteItem(ids)
    //             .subscribe({
    //                 next: (result: OperationResult) => {
    //                     if (result.success)
    //                         observer.next(result);
    //                     else {
    //                         observer.error(result);
    //                         this.snotifyService.error(result.message, CaptionConstants.ERROR);
    //                     }
    //                     observer.complete();
    //                 },
    //                 error: (e) => {
    //                     this.snotifyService.error(e, CaptionConstants.ERROR);
    //                     observer.error(e);
    //                     observer.complete();
    //                 },
    //             });
    //     })
    // }
    deleteLeafs(nodes: ExampleNode[]): Observable<any> {
        const results = nodes.map(node => {
            const leaf = this.MOCK_FILES.find(f => f.id === node.id);
            const index = this.MOCK_FILES.indexOf(leaf);
            this.MOCK_FILES.splice(index, 1);
            return of({});
        });
        return forkJoin(results);
    }
    // deleteLeafs(nodes: ExampleNode[]): Observable<any> {
    //     let ids: number[] = []
    //     nodes.map(node => ids.push(node.id as number));
    //     const source$: Observable<ItemModel> = this.deleteFile(ids);
    //     return source$
    // }
    // private deleteFile(ids: number[]): Observable<any> {
    //     return new Observable((observer: any) => {
    //         this.service.deleteItem(ids)
    //             .subscribe({
    //                 next: (result: OperationResult) => {
    //                     if (result.success)
    //                         observer.next(result);
    //                     else {
    //                         observer.error(result);
    //                         this.snotifyService.error(result.message, CaptionConstants.ERROR);
    //                     }
    //                     observer.complete();
    //                 },
    //                 error: (e) => {
    //                     this.snotifyService.error(e, CaptionConstants.ERROR);
    //                     observer.error(e);
    //                     observer.complete();
    //                 },
    //             });
    //     })
    // }
    createNode(node: ExampleNode, name: string): Observable<any> {
        const path = (node?.path ? node.path + '/' : '') + name;
        const id = ++this.folderId;
        const newFolder: ItemModel = {
            id,
            name,
            path,
            content: '',
            type: 'folder',
            size: null,
            last_Modified: new Date,
            isFolder: true
        };
        this.MOCK_FOLDERS.push(newFolder);
        this.helperService.refreshExplorer()
        return of(newFolder);
    }
    // createNode(node: ExampleNode, name: string): Observable<any> {
    //     const source$: Observable<ItemModel> = this.createFolder(node, name);
    //     return source$
    // }
    // private createFolder(node: ExampleNode, name: string): Observable<ItemModel> {
    //     return new Observable((observer: any) => {
    //         const path = (node?.path ? node.path + '/' : '') + name;
    //         const id = ++this.folderId;
    //         const newFolder: ItemModel = {
    //             id,
    //             name,
    //             path,
    //             content: '',
    //             type: 'folder',
    //             size: null,
    //             last_Modified: new Date,
    //             isFolder: true
    //         };
    //         this.service.createFolder(newFolder)
    //             .subscribe({
    //                 next: (result: OperationResult) => {
    //                     if (result.success)
    //                         observer.next(result);
    //                     else {
    //                         observer.error(result);
    //                         this.snotifyService.error(result.message, CaptionConstants.ERROR);
    //                     }
    //                     observer.complete();
    //                 },
    //                 error: (e) => {
    //                     observer.error(e);
    //                     this.snotifyService.error(e, CaptionConstants.ERROR);
    //                     observer.complete();
    //                 },
    //             });
    //     })
    // }
    getNodeChildren(node: ExampleNode): Observable<NodeContent<ExampleNode>> {
        const folderPath = node?.path || '';

        const nodes = this.MOCK_FOLDERS.filter(f => {
            const paths = f.path.split('/');
            paths.pop();
            const filteredPath = paths.join('/');
            return filteredPath === folderPath;
        });

        const leafs = this.MOCK_FILES.filter(f => {
            const paths = f.path.split('/');
            const filteredPath = paths.join('/');
            return filteredPath === folderPath;
        });

        return of({ leafs, nodes });
    }
    // getNodeChildren(node: ExampleNode): Observable<NodeContent<ItemModel>> {
    //     const source$: Observable<NodeContent<ItemModel>> = this.getFile(node);
    //     return source$
    // }
    // private getFile(node: ExampleNode): Observable<NodeContent<ItemModel>> {
    //     if (this.MOCK_FILES.length == 0 && this.MOCK_FOLDERS.length == 0)
    //         return new Observable((observer: any) => {
    //             let data = this.solveData(this.memoryData, node)
    //             observer.next(data);
    //             observer.complete();
    //         })
    //     return new Observable((observer: any) => {
    //         this.service.getAll()
    //             .subscribe({
    //                 next: (result) => {
    //                     let data = this.solveData(result, node)
    //                     observer.next(data);
    //                     observer.complete();
    //                 },
    //                 error: (e) => {
    //                     this.snotifyService.error(e, CaptionConstants.ERROR);
    //                     observer.error({});
    //                     observer.complete();
    //                 },
    //             });
    //     });
    // }
    // private solveData(data: ItemModel[], node: ExampleNode): NodeContent<ItemModel> {
    //     this.MOCK_FILES = data.filter(x => !x.isFolder)
    //     this.MOCK_FILES.map(x => {
    //         x.url = this.fileUrl + x.url
    //         x.last_Modified = new Date(x.last_Modified)
    //     })
    //     this.MOCK_FOLDERS = data.filter(x => x.isFolder)
    //     this.MOCK_FOLDERS.map(x => {
    //         x.last_Modified = new Date(x.last_Modified)
    //     })
    //     const folderPath = node?.path || '';
    //     const nodes = this.MOCK_FOLDERS.filter(f => {
    //         const paths = f.path.split('/');
    //         paths.pop();
    //         const filteredPath = paths.join('/');
    //         return filteredPath === folderPath;
    //     });
    //     const leafs = this.MOCK_FILES.filter(f => {
    //         const paths = f.path.split('/');
    //         const filteredPath = paths.join('/');
    //         return filteredPath === folderPath;
    //     });
    //     return <NodeContent<any>>{ leafs: leafs, nodes: nodes }
    // }
    renameNode(nodeInfo: ExampleNode, newName: string): Observable<ExampleNode> {
        const node = this.MOCK_FOLDERS.find(f => f.id === nodeInfo.id);
        const nodePathArray = node.path.split('/')
        nodePathArray[nodePathArray.length - 1] = newName
        const newPath = nodePathArray.join('/')
        this.MOCK_FOLDERS.filter(x => x.path.startsWith(nodeInfo.path) && x.id != nodeInfo.id).map(x => x.path = newPath + x.path.slice(nodeInfo.path.length, x.path.length))
        this.MOCK_FILES.filter(x => x.path.startsWith(nodeInfo.path)).map(x => x.path = newPath + x.path.slice(nodeInfo.path.length, x.path.length))
        node.path = newPath
        node.name = newName;
        return of(node);
    }

    renameLeaf(leafInfo: ExampleNode, newName: string): Observable<ExampleNode> {
        const leaf = this.MOCK_FILES.find(f => f.id === leafInfo.id);
        leaf.name = newName;
        return of(leaf);
    }
    // renameNode(nodeInfo: ExampleNode, newName: string): Observable<ItemModel> {
    //     const node = this.MOCK_FOLDERS.find(f => f.id === nodeInfo.id);
    //     const nodePathArray = node.path.split('/')
    //     nodePathArray[nodePathArray.length - 1] = newName
    //     const newPath = nodePathArray.join('/')
    //     this.MOCK_FOLDERS.filter(x => x.path.startsWith(nodeInfo.path) && x.id != nodeInfo.id).map(x => x.path = newPath + x.path.slice(nodeInfo.path.length, x.path.length))
    //     this.MOCK_FILES.filter(x => x.path.startsWith(nodeInfo.path)).map(x => x.path = newPath + x.path.slice(nodeInfo.path.length, x.path.length))
    //     node.path = newPath
    //     node.name = newName;
    //     const source$: Observable<ItemModel> = this.rename(node);
    //     return source$
    // }
    // renameLeaf(leafInfo: ExampleNode, newName: string): Observable<ItemModel> {
    //     const leaf = this.MOCK_FILES.find(f => f.id === leafInfo.id);
    //     leaf.name = newName;
    //     const source$: Observable<ItemModel> = this.rename(leaf);
    //     return source$
    // }
    // private rename(node: ItemModel): Observable<any> {
    //     return new Observable((observer: any) => {
    //         this.service.rename(node)
    //             .subscribe({
    //                 next: (result: OperationResult) => {
    //                     if (result.success)
    //                         observer.next(result);
    //                     else {
    //                         observer.error(result);
    //                         this.snotifyService.error(result.message, CaptionConstants.ERROR);
    //                     }
    //                     observer.complete();
    //                 },
    //                 error: (e) => {
    //                     this.snotifyService.error(e, CaptionConstants.ERROR);
    //                     observer.error(e);
    //                     observer.complete();
    //                 },
    //             });
    //     })
    // }
    console(isFolder?: boolean) {
        isFolder ? console.log(this.MOCK_FOLDERS)
            : console.log(this.MOCK_FILES)
    }
    checkEmpty(str: string) {
        return !str || /^\s*$/.test(str);
    }
}
