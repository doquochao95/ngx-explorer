import { FILTER_STRING } from './../../injection-tokens/tokens';
import { Component, OnInit, HostListener, ViewChild, ElementRef, Inject } from '@angular/core';
import { ContextMenu } from '../../shared/context-menu';
import { BaseView } from '../../directives/base-view.directive';
import { ExplorerService } from '../../services/explorer.service';
import { HelperService } from '../../services/helper.service';
import { BehaviorSubject } from 'rxjs';
import { ContextMenuOption } from '../../shared/types';
import { BsModalService } from 'ngx-bootstrap/modal';
import { DefaultConfig } from '../../shared/default-config';

@Component({
    selector: 'nxe-context-menu',
    templateUrl: './context-menu.component.html',
    styleUrls: ['./context-menu.component.scss']
})
export class ContextMenuComponent extends BaseView implements OnInit {
    @HostListener('mouseover', ['$event'])
    public mouseouver(event: MouseEvent): void {
        this.setInactive(this.elements);
    }

    @HostListener('document:keyup', ['$event'])
    public keyUp(event: KeyboardEvent): void {
        if (!this.visible) return;

        event.preventDefault();

        const activeItem = this.elements.findIndex(e => e.active);
        if (event.key === 'ArrowDown') {
            if (activeItem < 0) this.elements[0].active = true;
            this.elements[activeItem].active = false;

            const isLast = activeItem === this.elements.length - 1;
            this.elements[isLast ? 0 : activeItem + 1].active = true;
        } else if (event.key === 'ArrowUp') {
            if (activeItem < 0) this.elements[0].active = true;
            this.elements[activeItem].active = false;

            const isFirst = activeItem === 0;
            this.elements[isFirst ? this.elements.length - 1 : activeItem - 1].active = true;
        } else if (event.key === 'ArrowRight') {
            if (activeItem < 0) return;
            this.elements[activeItem].visible = true;
            this.elements[activeItem].submenu[0].active = true;
        } else if (event.key === 'Enter') {
            if (activeItem < 0 || !this.elements[activeItem].action) return;
            this.elements[activeItem].action();
            this.elements.forEach(e => this.hide(e))
        } else if (event.key === 'Escape') {
            this.elements.forEach(e => this.hide(e))
        }

        console.log(event.key)

        // ArrowDown
        // ArrowUp
        // ArrowLeft
        // ArrowRight
        // Enter
    }

    @HostListener('document:click', ['$event'])
    public documentClick(event: MouseEvent): void {
        this.elements.forEach(e => this.hide(e))
    }

    @HostListener('document:contextmenu', ['$event'])
    public documentRClick(event: MouseEvent): void {
        if (!this.elements || !this.navRef) return;
        let isRight = true;
        let isTop = true;
        const contextMenu = this.navRef.nativeElement;
        const x = event.clientX + this.config.globalOptions.offSetLeft;
        const y = event.clientY - this.config.globalOptions.offSetTop;
        this.top = `${y}px`;
        this.right = `${window.innerWidth - contextMenu.offsetWidth - x}px`;
        if (contextMenu.offsetWidth + x > window.innerWidth + this.config.globalOptions.offSetLeft - this.config.globalOptions.offSetRight) {
            this.right = `${window.innerWidth - x}px`;
            isRight = false;
        }
        if (contextMenu.offsetHeight + y > window.innerHeight - this.config.globalOptions.offSetTop - this.config.globalOptions.offSetBottom) {
            this.top = `${y - contextMenu.offsetHeight}px`;
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
        explorerService: ExplorerService,
        helperService: HelperService,
        modalService: BsModalService,
        public config: DefaultConfig,
        @Inject(FILTER_STRING) filter: BehaviorSubject<string>
    ) {
        super(explorerService, helperService, modalService, filter);
    }

    ngOnInit() { }

    hide(element: ContextMenu) {
        element.visible = false;
        if (element && element.submenu) {
            element.submenu.forEach(e => this.hide(e));
        }
        const data: ContextMenuOption = <ContextMenuOption>{
            visible: false,
            elements: this.elements
        }
        this.explorerService.setContextMenu(data)
    }

    setInactive(elements: ContextMenu[]) {
        elements.forEach(element => {
            element.active = false;
            if (!element.submenu) return;
            this.setInactive(element.submenu);
        })
    }

}
