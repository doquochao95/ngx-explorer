import { HelperService } from './../../projects/ngx-explorer-sdteam/src/lib/services/helper.service';
import { AfterViewInit, Component } from '@angular/core';
import { ExampleNode, IDataService, ItemModel, NodeContent } from 'ngx-explorer-sdteam';
import { Observable, of, Subscriber, forkJoin, delay, switchMap } from 'rxjs';
import { AppDataService } from './app-data.service';
import { environment } from 'src/environments/environment';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent implements IDataService<ExampleNode> {
    title = 'explorer-app';
    isCollapsed = false;
    private id = 0;
    private folderId = 20;
    MOCK_FOLDERS: ItemModel[] = []
    MOCK_FILES: ItemModel[] = []
    base64Image: any;
    filter: string = 'Home/marguerite-729510_640.jpg'
    baseUrl = environment.baseUrl;

    constructor(private service: AppDataService, private helperService: HelperService) {
        this.MOCK_FILES = this.service.getDataFile()
        this.MOCK_FOLDERS = this.service.getDataFolder()
    }
    getFilterString(): Observable<any> {
        return of(`${this.filter}`);
    }
    getBaseUrl(): Observable<any> {
        return of(`${this.baseUrl}#/admin/file-explorer?filter=`);
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

    deleteLeafs(nodes: ExampleNode[]): Observable<any> {
        const results = nodes.map(node => {
            const leaf = this.MOCK_FILES.find(f => f.id === node.id);
            const index = this.MOCK_FILES.indexOf(leaf);
            this.MOCK_FILES.splice(index, 1);
            return of({});
        });
        return forkJoin(results);
    }

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
    console(isFolder?: boolean) {
        isFolder ? console.log(this.MOCK_FOLDERS)
            : console.log(this.MOCK_FILES)
    }
    checkEmpty(str: string) {
        return !str || /^\s*$/.test(str);
    }
}
