import { Component } from '@angular/core';
import { ExampleNode, IDataService, ItemModel, NodeContent } from 'ngx-explorer';
import { Observable, of, Subscriber, forkJoin, delay } from 'rxjs';
import { AppDataService } from './app-data.service';

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

    constructor(private service: AppDataService) {
        this.MOCK_FILES = this.service.getDataFile()
        this.MOCK_FOLDERS = this.service.getDataFolder()
    }
    download(node: ExampleNode): Observable<any> {
        const file = this.MOCK_FILES.find(f => f.id === node.id);
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
        return of(null);
    }

    public uploadFiles(node: ExampleNode, file: File): Observable<any> {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        const id = ++this.id;
        reader.onload = () => {
            const nodePath = node ? this.MOCK_FOLDERS.find(f => f.id === node.id).path : '';
            const newFile: ItemModel = {
                id,
                name: file.name,
                path: nodePath + '/' + file.name,
                content: reader.result as string,
                type: file.type,
                size: file.size,
                last_Modified: new Date,
                isFolder: false
            };
            this.MOCK_FILES.push(newFile);
        };
        return of(file).pipe(delay(this.randomDelay(500,1000)))
    }
    private randomDelay(bottom: number, top: number): number {
        return Math.floor(Math.random() * (1 + top - bottom)) + bottom;
    }

    deleteNodes(nodes: ExampleNode[]): Observable<any> {
        const results = nodes.map(node => {
            const path = node.path + '/';
            this.MOCK_FILES = this.MOCK_FILES.filter(f => !f.path.startsWith(path));
            this.MOCK_FOLDERS = this.MOCK_FOLDERS.filter(f => !f.path.startsWith(path));
            this.MOCK_FOLDERS = this.MOCK_FOLDERS.filter(f => f.id !== node.id);
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
        const path = (node?.path ? node.path + '/' : '') + name.replace(/[\W_]+/g, ' ');
        const id = ++this.folderId;
        const newFolder: ItemModel = {
            id,
            name,
            path,
            content: '',
            type: 'Folder',
            size: null,
            last_Modified: new Date,
            isFolder: true
        };
        this.MOCK_FOLDERS.push(newFolder);
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
            paths.pop();
            const filteredPath = paths.join('/');
            return filteredPath === folderPath;
        });

        return of({ leafs, nodes });
    }

    renameNode(nodeInfo: ExampleNode, newName: string): Observable<ExampleNode> {
        const node = this.MOCK_FOLDERS.find(f => f.id === nodeInfo.id);
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
}
