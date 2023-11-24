import { Component, Inject, ViewEncapsulation } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { FILTER_STRING } from '../../injection-tokens/tokens';
import { ExplorerService } from '../../services/explorer.service';
import { HelperService } from '../../services/helper.service';
import { BaseView } from '../base-view/base-view.directive';

@Component({
    selector: 'nxe-icons',
    templateUrl: './icons.component.html',
    styleUrls: ['./icons.component.scss'],
    encapsulation: ViewEncapsulation.None,
})
export class IconsComponent extends BaseView {

    public readonly icons = {
        folder: 'icon-folder',
        doc: 'icon-doc',
        pdf:'icon-file-pdf',
        word:'icon-file-word',
        excel:'icon-file-excel',
        powerpoint:'icon-file-powerpoint',
        image:'icon-file-image',
        archive:'icon-file-archive',
        video:'icon-file-video',
    };

    constructor(explorerService: ExplorerService, helperService: HelperService, @Inject(FILTER_STRING) filter: BehaviorSubject<string>) {
        super(explorerService, helperService, filter);
    }

}
