import { NgModule } from '@angular/core';
import { IconsComponent } from './components/icons/icons.component';
import { CommonModule } from '@angular/common';
import { ExplorerComponent } from './components/explorer/explorer.component';
import { MenuBarComponent } from './components/menu-bar/menu-bar.component';
import { BreadcrumbsComponent } from './components/breadcrumbs/breadcrumbs.component';
import { ListComponent } from './components/list/list.component';
import { SecondMenuBarComponent } from './components/second-menu-bar/second-menu-bar.component';
import { ViewSwitcherComponent } from './components/view-switcher/view-switcher.component';
import { TreeComponent } from './components/tree/tree.component';
import { FilterComponent } from './components/filter/filter.component';
import { DragDropDirective } from './directives/drag-drop.directive';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { ModalModule } from 'ngx-bootstrap/modal';
import { FormsModule } from '@angular/forms';
import { FileSizePipe } from './pipes/file-size.pipe';
import { DateTypePipe } from './pipes/date-type.pipe';
import { FileTypePipe } from './pipes/file-type.pipe';
import { AlertModule } from 'ngx-bootstrap/alert';
import { ProgressbarModule } from 'ngx-bootstrap/progressbar';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { ContextMenuComponent } from './components/context-menu/context-menu.component';
import { ContextMenuItemComponent } from './components/context-menu/context-menu-item/context-menu-item.component';
import { GlobalBase } from './common/global-base';

@NgModule({
    declarations: [
        ExplorerComponent,
        IconsComponent,
        MenuBarComponent,
        BreadcrumbsComponent,
        ListComponent,
        SecondMenuBarComponent,
        ViewSwitcherComponent,
        TreeComponent,
        FilterComponent,
        ContextMenuComponent,
        ContextMenuItemComponent,
        DragDropDirective,
        FileSizePipe,
        DateTypePipe,
        FileTypePipe
    ],
    imports: [
        CommonModule,
        FormsModule,
        ClipboardModule,
        TooltipModule.forRoot(),
        ModalModule.forRoot(),
        ProgressbarModule.forRoot()
    ],
    exports: [
        ExplorerComponent,
        IconsComponent,
        MenuBarComponent,
        BreadcrumbsComponent,
        ListComponent,
        SecondMenuBarComponent,
        ViewSwitcherComponent,
        TreeComponent,
        FilterComponent,
        ContextMenuComponent
    ],
    providers: [ GlobalBase ],
})
export class NgxExplorerModule { }
