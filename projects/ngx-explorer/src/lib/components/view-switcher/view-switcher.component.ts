import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AvialableView } from '../../shared/types';
import { CURRENT_VIEW } from '../../injection-tokens/tokens';
import { animate, keyframes, style, transition, trigger } from '@angular/animations';

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

    public readonly avialableView = AvialableView;
    selected_Type: string = 'Icon'
    constructor(@Inject(CURRENT_VIEW) private currentView: BehaviorSubject<AvialableView>) {
    }

    setView(view: AvialableView) {
        if (view == 'Icon')
            this.iconClicked = !Boolean(this.iconClicked);
        else
            this.detailClicked = !Boolean(this.detailClicked);
        this.selected_Type = view
        this.currentView.next(view);
    }

}
