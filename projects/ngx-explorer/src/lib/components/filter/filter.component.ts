import { Component, ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FILTER_STRING } from '../../injection-tokens/tokens';
import { ExplorerService } from '../../services/explorer.service';
import { DefaultConfig } from '../../shared/default-config';

@Component({
    selector: 'nxe-filter',
    templateUrl: './filter.component.html',
    styleUrls: ['./filter.component.scss']
})
export class FilterComponent implements OnDestroy {
    @ViewChild('input') input: ElementRef<HTMLInputElement>;

    private sub = new Subscription();
    placeHolder: string = "Search"
    constructor(
        @Inject(FILTER_STRING) private filter: BehaviorSubject<string>,
        explorerService: ExplorerService,
        public config: DefaultConfig
    ) {
        this.sub.add(explorerService.tree.subscribe(() => {
            this.clear();
        }));
        this.sub.add(explorerService.openedNode.subscribe((e: any) => {
            this.placeHolder = `Search ${e.data?.name || this.config.globalOptions.homeNodeName}`
        }));
    }

    onChange(e: KeyboardEvent, value: string) {
        if (e.key === 'Escape') {
            this.input.nativeElement.value = '';
            this.filter.next('');
            return;
        }
        this.filter.next(value.trim());
    }

    clear() {
        if (!this.input) { return; }
        this.input.nativeElement.value = '';
        this.filter.next('');
    }

    ngOnDestroy() {
        this.sub.unsubscribe();
    }

}
