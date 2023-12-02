import { Component } from '@angular/core';
import { ExampleNode, IDataService, ItemModel, NodeContent } from 'ngx-explorer';
import { Observable, of, Subscriber, forkJoin } from 'rxjs';

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
    MOCK_FOLDERS: ItemModel[] = [
        { id: 1, name: 'Music', path: 'music', type: "Folder", size: null, last_Modified: new Date, content: '', isFolder: true },
        { id: 2, name: 'Movies', path: 'movies', type: "Folder", size: null, last_Modified: new Date, content: '', isFolder: true },
        { id: 3, name: 'Books', path: 'books', type: "Folder", size: null, last_Modified: new Date, content: '', isFolder: true },
        { id: 4, name: 'Games', path: 'games', type: "Folder", size: null, last_Modified: new Date, content: '', isFolder: true },
        { id: 5, name: 'Rock', path: 'music/rock', type: "Folder", size: null, last_Modified: new Date, content: '', isFolder: true },
        { id: 6, name: 'Jazz', path: 'music/jazz', type: "Folder", size: null, last_Modified: new Date, content: '', isFolder: true },
        { id: 7, name: 'Classical', path: 'music/classical', type: "Folder", size: null, last_Modified: new Date, content: '', isFolder: true },
        { id: 15, name: 'Aerosmith', path: 'music/rock/aerosmith', type: "Folder", size: null, last_Modified: new Date, content: '', isFolder: true },
        { id: 16, name: 'AC/DC', path: 'music/rock/acdc', type: "Folder", size: null, last_Modified: new Date, content: '', isFolder: true },
        { id: 17, name: 'Led Zeppelin', path: 'music/rock/ledzeppelin', type: "Folder", size: null, last_Modified: new Date, content: '', isFolder: true },
        { id: 18, name: 'The Beatles', path: 'music/rock/thebeatles', type: "Folder", size: null, last_Modified: new Date, content: '', isFolder: true },
    ];
    MOCK_FILES: ItemModel[] = [
        { id: 428, name: 'notes.txt', path: '', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
        { id: 4281, name: '2.txt', path: '', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
        { id: 28, name: 'Thriller.txt', path: 'music/rock/thebeatles/thriller', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
        { id: 29, name: 'Back in the U.S.S.R.txt', path: 'music/rock/thebeatles', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
        { id: 30, name: 'All You Need Is Love.txt', path: 'music/rock/thebeatles', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
        { id: 31, name: 'Hey Jude.txt', path: 'music/rock/ledzeppelin/heyjude', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
        { id: 32, name: 'Rock And Roll All Nite.txt', path: 'music/rock/ledzeppelin/rockandrollallnight', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
    ];
    constructor() { }
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

    uploadFiles(node: ExampleNode, files: FileList): Observable<any> {
        const results = [];

        for (let i = 0; i < files.length; i++) {
            const file = files.item(i);
            const obs = new Observable((observer: Subscriber<any>): void => {
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
                    observer.next(reader.result);
                    observer.complete();
                };
            });
            results.push(obs);
        }
        return forkJoin(results);
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
