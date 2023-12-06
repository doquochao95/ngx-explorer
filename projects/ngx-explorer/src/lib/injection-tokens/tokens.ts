import { InjectionToken } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { NgExplorerOption } from '../shared/types';

export const FILTER_STRING = new InjectionToken<BehaviorSubject<string>>('FILTER_STRING', {
    providedIn: 'root',
    factory: () => new BehaviorSubject(''),
});

export const NGX_EXPLORER_OPTION = new InjectionToken<NgExplorerOption>('NGX_EXPLORER_OPTION');
