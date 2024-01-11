import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { AppComponent } from './app.component';
import { FormsModule } from '@angular/forms';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { FileExplorerModule } from './file-explorer/file-explorer.module';
import { AppRoutingModule } from './app.routing';

@NgModule({
    declarations: [
        AppComponent,
    ],
    imports: [
        BrowserModule,
        FormsModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        FileExplorerModule,
        RouterModule.forRoot([]),
    ],
    bootstrap: [AppComponent]
})
export class AppModule { }
