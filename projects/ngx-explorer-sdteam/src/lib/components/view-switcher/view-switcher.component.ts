import { Component, ViewEncapsulation } from '@angular/core';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';
import { DefaultConfig } from '../../shared/default-config';

@Component({
    selector: 'nxe-view-switcher',
    templateUrl: './view-switcher.component.html',
    styleUrls: ['./view-switcher.component.scss'],
    animations: [
        trigger('wasClicked', [
            transition('* <=> true', [
                animate('0.3s', keyframes([
                    style({ transform: 'scale(1)', offset: 0 }),
                    style({ transform: 'scale(1.1)', offset: 0.2 }),
                    style({ transform: 'scale(1.2)', offset: 0.5 }),
                    style({ transform: 'scale(1.1)', offset: 0.7 }),
                    style({ transform: 'scale(1)', offset: 1 })
                ]))
            ]),
        ]),
    ],
    encapsulation: ViewEncapsulation.None
})
export class ViewSwitcherComponent {
    iconClicked = false;
    detailClicked = false;
    selected_Type: string = 'Icon'

    constructor(public config: DefaultConfig) {
    }

    setView(view: string) {
        if (view == 'Icon')
            this.iconClicked = !Boolean(this.iconClicked);
        else
            this.detailClicked = !Boolean(this.detailClicked);
        this.config.globalOptions.defaultViewType = view
    }

}
