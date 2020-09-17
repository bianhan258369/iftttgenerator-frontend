import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainUIComponent } from './main-ui/main-ui.component';

import { CommonModule }     from '@angular/common';
import { FileUploadModule } from 'ng2-file-upload';
import { FormsModule } from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';
import { MonacoEditorModule } from "ngx-monaco-editor";
import { MonacoConfig } from "./monaco-config";

@NgModule({
  declarations: [
    AppComponent,
    MainUIComponent,
  ],
  imports: [
    CommonModule,
    FileUploadModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule,
    MonacoEditorModule.forRoot(MonacoConfig)
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
