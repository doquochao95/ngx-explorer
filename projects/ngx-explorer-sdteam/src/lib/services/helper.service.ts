import { Injectable } from '@angular/core';
import { IHelperService } from '../shared/types';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class HelperService implements IHelperService {
    readonly emitter = new Subject<string | null>();

    constructor() { }
    refreshExplorer(): void {
        this.emitter.next('refresh');
    }
    getFormat(data: any): string {
        let name: string = data?.name as string;
        let arr: string[] = name.split('.')
        return arr[arr.length - 1]
    }
}
