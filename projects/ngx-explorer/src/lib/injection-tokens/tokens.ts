import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AvialableView, NgExplorerOption } from '../shared/types';

export const CURRENT_VIEW = new InjectionToken<BehaviorSubject<AvialableView>>('CURRENT_VIEW', {
    providedIn: 'root',
    factory: () => new BehaviorSubject(AvialableView.Icon),
});

export const FILTER_STRING = new InjectionToken<BehaviorSubject<string>>('FILTER_STRING', {
    providedIn: 'root',
    factory: () => new BehaviorSubject(''),
});

export const NGX_EXPLORER_OPTION = new InjectionToken<NgExplorerOption>('NGX_EXPLORER_OPTION');
