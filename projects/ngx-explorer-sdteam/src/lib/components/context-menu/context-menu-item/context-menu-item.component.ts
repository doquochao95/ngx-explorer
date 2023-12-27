import { Component, OnInit, HostListener, EventEmitter, Input, Output } from '@angular/core';
import { ContextMenu } from '../../../shared/context-menu';

@Component({
    selector: 'nxe-context-menu-item',
    templateUrl: './context-menu-item.component.html',
    styleUrls: ['./context-menu-item.component.scss']
})
export class ContextMenuItemComponent implements OnInit {
    @HostListener('click', ['$event'])
    public click(event: MouseEvent): void {
        event.preventDefault();
        event.stopPropagation();

        if (!this.element.action) return;

        this.element.action();
        this.clicked.emit();
    }

    @HostListener('mouseover', ['$event'])
    public mouseover(event: MouseEvent): void {
        this.submenuOpen();
    }

    @HostListener('mouseleave', ['$event'])
    public documentClick(event: MouseEvent): void {
        this.submenuClose();
    }

    @Input() element: ContextMenu;
    @Output() clicked = new EventEmitter();

    constructor() { }

    ngOnInit() {
    }

    submenuOpen() {
        if (this.element.submenu) {
            this.element.visible = true;
        }
    }

    submenuClose() {
        if (this.element.submenu) {
            this.element.visible = false;
        }
    }
}
