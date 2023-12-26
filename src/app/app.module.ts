import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { NgxExplorerModule, DataService } from 'ngx-explorer-sdteam';
import { FormsModule } from '@angular/forms';
import { CollapseModule } from 'ngx-bootstrap/collapse';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        NgxExplorerModule,
        CollapseModule,
        BrowserAnimationsModule
    ],
    providers: [
        { provide: DataService, useClass: AppComponent }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
