import { DataService, NgxExplorerModule } from 'ngx-explorer-sdteam';
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { FileExplorerRoutingModule } from './file-explorer-routing.module';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { MainComponent } from './main/main.component';

@NgModule({
    imports: [
        FileExplorerRoutingModule,
        FormsModule,
        CommonModule,
        CollapseModule,
        NgxExplorerModule
    ],
    exports: [],
    declarations: [MainComponent],
    providers: [
        { provide: DataService, useClass: MainComponent }
    ]
})
export class FileExplorerModule { }
