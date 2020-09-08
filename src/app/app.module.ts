import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { MainUIComponent } from './main-ui/main-ui.component';

import { CommonModule }     from '@angular/common';
import { FileUploadModule } from 'ng2-file-upload';
import { FormsModule } from '@angular/forms';
import { HttpClientModule }    from '@angular/common/http';


@NgModule({
  declarations: [
    AppComponent,
    MainUIComponent
  ],
  imports: [
    CommonModule,
    FileUploadModule,
    BrowserModule,
    AppRoutingModule,
    FormsModule,
    HttpClientModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
