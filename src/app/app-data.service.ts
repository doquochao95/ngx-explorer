import { Injectable } from '@angular/core';
import { TRANSITION_DURATIONS } from 'ngx-bootstrap/modal/modal-options.class';
import { ItemModel } from 'ngx-explorer-sdteam';
import { Observable, Observer } from "rxjs";

let MOCK_FOLDERS_data: ItemModel[] = [
    { id: 1, name: 'Music', path: 'Music', type: "folder", size: null, last_Modified: new Date, content: '', isFolder: true },
    { id: 2, name: 'Movies', path: 'Movies', type: "folder", size: null, last_Modified: new Date, content: '', isFolder: true },
    { id: 3, name: 'Books', path: 'Books', type: "folder", size: null, last_Modified: new Date, content: '', isFolder: true },
    { id: 4, name: 'Games', path: 'Games', type: "folder", size: null, last_Modified: new Date, content: '', isFolder: true },
    { id: 5, name: 'Rock', path: 'Music/Rock', type: "folder", size: null, last_Modified: new Date, content: '', isFolder: true },
    { id: 6, name: 'Jazz', path: 'Music/Jazz', type: "folder", size: null, last_Modified: new Date, content: '', isFolder: true },
    { id: 7, name: 'Classical', path: 'Music/Classical', type: "folder", size: null, last_Modified: new Date, content: '', isFolder: true },
    { id: 15, name: 'Aerosmith', path: 'Music/Rock/Aerosmith', type: "folder", size: null, last_Modified: new Date, content: '', isFolder: true },
    { id: 16, name: 'AC-DC', path: 'Music/Rock/AC-DC', type: "folder", size: null, last_Modified: new Date, content: '', isFolder: true },
    { id: 17, name: 'Led Zeppelin', path: 'Music/Rock/Led Zeppelin', type: "folder", size: null, last_Modified: new Date, content: '', isFolder: true },
    { id: 18, name: 'The Beatles', path: 'Music/Rock/The Beatles', type: "folder", size: null, last_Modified: new Date, content: '', isFolder: true },
    { id: 19, name: 'the beatles', path: 'Music/Rock/the beatles', type: "folder", size: null, last_Modified: new Date, content: '', isFolder: true },
];

let MOCK_FILES_data: ItemModel[] = [
    { id: 428, name: 'notes.txt', path: '', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
    { id: 4281, name: '2.txt', path: '', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
    { id: 28, name: 'Thriller.txt', path: 'Music/Rock/The Beatles/Thriller', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
    { id: 29, name: 'Back in the U.S.S.R.txt', path: 'Music/Rock/The Beatles', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
    { id: 30, name: 'All You Need Is Love.txt', path: 'Music/Rock/the beatles', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
    { id: 31, name: 'Hey Jude.txt', path: 'Music/Rock/Led Zeppelin', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
    { id: 32, name: 'Rock And Roll All Nite.txt', path: 'Music/Rock/Led Zeppelin', content: 'hi, this is an example', type: "Text File", size: null, last_Modified: new Date, isFolder: false },
    { id: 33, name: 'marguerite-729510_640.jpg', path: '', url: 'https://dfstudio-d420.kxcdn.com/wordpress/wp-content/uploads/2019/06/digital_camera_photo-1080x675.jpg', type: "image/jpeg", size: 36124, last_Modified: new Date, isFolder: false },
];

@Injectable({
    providedIn: 'root'
})
export class AppDataService {

    constructor() { }
    getDataFolder(): ItemModel[] {
        return MOCK_FOLDERS_data
    }
    getDataFile(): ItemModel[] {
        return MOCK_FILES_data
    }

    getBase64ImageFromURL(url: string) {
        return new Observable((observer: Observer<string>) => {
            const img: HTMLImageElement = new Image();
            img.crossOrigin = "Anonymous";
            img.src = url;
            if (!img.complete) {
                img.onload = () => {
                    observer.next(this.getBase64Image(img));
                    observer.complete();
                };
                img.onerror = err => {
                    observer.error(err);
                };
            } else {
                observer.next(this.getBase64Image(img));
                observer.complete();
            }
        });
    }

    getBase64Image(img: HTMLImageElement) {
        const canvas: HTMLCanvasElement = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx: CanvasRenderingContext2D = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0);
        const dataURL: string = canvas.toDataURL("image/png");
        return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
    }
}

