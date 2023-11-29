import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { NgxExplorerModule, DataService } from 'ngx-explorer';
import { ExampleDataService } from './data.service';
import { FormsModule } from '@angular/forms';
@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        NgxExplorerModule
    ],
    providers: [
        { provide: DataService, useClass: ExampleDataService }
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
