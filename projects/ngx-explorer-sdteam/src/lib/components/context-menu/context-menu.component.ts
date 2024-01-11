import { Component, HostListener, ViewChild, ElementRef } from '@angular/core';
import { ContextMenu } from '../../shared/context-menu';
import { BaseView } from '../../directives/base-view.directive';
import { GlobalBase } from '../../common/global-base';

@Component({
    selector: 'nxe-context-menu',
    templateUrl: './context-menu.component.html',
    styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent extends BaseView {
    @HostListener('mouseover', ['$event'])
    public mouseouver(): void {
        this.setInactive(this.globalbase.elements);
    }

    @HostListener('document:keyup', ['$event'])
    public keyUp(event: KeyboardEvent): void {
        if (!this.globalbase.visible) return;

        event.preventDefault();

        const activeItem = this.globalbase.elements.findIndex(e => e.isActived);
        if (event.key === 'ArrowDown') {
            if (activeItem < 0) this.globalbase.elements[0].isActived = true;
            this.globalbase.elements[activeItem].isActived = false;

            const isLast = activeItem === this.globalbase.elements.length - 1;
            this.globalbase.elements[isLast ? 0 : activeItem + 1].isActived = true;
        } else if (event.key === 'ArrowUp') {
            if (activeItem < 0) this.globalbase.elements[0].isActived = true;
            this.globalbase.elements[activeItem].isActived = false;

            const isFirst = activeItem === 0;
            this.globalbase.elements[isFirst ? this.globalbase.elements.length - 1 : activeItem - 1].isActived = true;
        } else if (event.key === 'ArrowRight') {
            if (activeItem < 0) return;
            this.globalbase.elements[activeItem].isVisibled = true;
            this.globalbase.elements[activeItem].submenu[0].isActived = true;
        } else if (event.key === 'Enter') {
            if (activeItem < 0 || !this.globalbase.elements[activeItem].action) return;
            this.globalbase.elements[activeItem].action();
            this.globalbase.elements.forEach(e => this.hide(e))
        } else if (event.key === 'Escape') {
            this.globalbase.elements.forEach(e => this.hide(e))
        }
    }

    @HostListener('document:click', ['$event'])
    public documentClick(): void {
        this.globalbase.elements.forEach(e => this.hide(e))
    }

    @HostListener('document:contextmenu', ['$event'])
    public documentRClick(event: MouseEvent): void {
        if (!this.globalbase.elements || !this.navRef) return;
        let isRight = true;
        let isTop = true;
        const contextMenu = this.navRef.nativeElement;
        const x = event.clientX + this.globalbase.config.globalOptions.offSetLeft;
        const y = event.clientY - this.globalbase.config.globalOptions.offSetTop;
        this.globalbase.top = `${y}px`;
        this.globalbase.right = `${window.innerWidth - contextMenu.offsetWidth - x}px`;
        if (contextMenu.offsetWidth + x > window.innerWidth + this.globalbase.config.globalOptions.offSetLeft - this.globalbase.config.globalOptions.offSetRight) {
            this.globalbase.right = `${window.innerWidth - x}px`;
            isRight = false;
        }
        if (contextMenu.offsetHeight + y > window.innerHeight - this.globalbase.config.globalOptions.offSetTop - this.globalbase.config.globalOptions.offSetBottom) {
            this.globalbase.top = `${y - contextMenu.offsetHeight}px`;
            isTop = false;
        }
        //animation
        if (isTop)
            contextMenu.style.transformOrigin = isRight ? 'top left' : 'top right';
        else
            contextMenu.style.transformOrigin = isRight ? 'bottom left' : 'bottom right';
    }

    @ViewChild('nav') navRef: ElementRef;

    constructor(
        public globalbase: GlobalBase
    ) {
        super();
    }
    hide(element: ContextMenu) {
        element.isVisibled = false;
        if (element && element.submenu) {
            element.submenu.forEach(e => this.hide(e));
        }
        this.globalbase._isVisibled = false
    }

    setInactive(elements: ContextMenu[]) {
        elements.forEach(element => {
            element.isActived = false;
            if (!element.submenu) return;
            this.setInactive(element.submenu);
        })
    }
}
