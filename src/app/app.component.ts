import { Component } from '@angular/core';
import { ItemModel } from 'ngx-explorer';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {
    title = 'explorer-app';
    isCollapsed = false;

    MOCK_FILES: ItemModel[] = []
    MOCK_FOLDERS: ItemModel[] = []

    constructor() { }

    console(isFolder?: boolean) {
        isFolder ? console.log(this.MOCK_FOLDERS)
            : console.log(this.MOCK_FILES)
    }
}
