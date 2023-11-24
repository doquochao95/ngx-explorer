import { Injectable } from '@angular/core';
import { IHelperService } from '../shared/types';

@Injectable({
    providedIn: 'root'
})
export class HelperService implements IHelperService {

    getName(data: any): string {
        return data?.name;
    }
    getFormat(data: any): string {
        let name :string = data?.name as string;
        let arr : string [] = name.split('.')
        return arr[arr.length-1]
    }
}
