import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filetype'
})
export class FileTypePipe implements PipeTransform {
    transform(typeString: string) {
        if (typeString.indexOf('excel') > -1 || typeString.indexOf('sheet') > -1)
            return 'Excel File'
        if (typeString.indexOf('word') > -1)
            return 'Word File'
        if (typeString.indexOf('presentation') > -1)
            return 'PowerPoint File'
        if (typeString.indexOf('image') > -1)
            return 'Image File'
        if (typeString.indexOf('video') > -1)
            return 'Video File'
        return 'Other File'
    }
}
