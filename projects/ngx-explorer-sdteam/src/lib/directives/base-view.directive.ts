import { Directive, ElementRef, HostListener, TemplateRef, ViewChild } from '@angular/core';

@Directive()
export class BaseView {
    @ViewChild('uploader', { static: true }) uploader: ElementRef;
    @ViewChild('upload') upload: TemplateRef<any>;
    @ViewChild('modify') modify: TemplateRef<any>;

    @HostListener('mousedown', ['$event'])
    public mousedown(event: MouseEvent): void {
        if (event.ctrlKey || event.shiftKey)
            event.preventDefault();
    }
}
