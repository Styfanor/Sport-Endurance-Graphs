import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { CalPlotComponent } from './components/cal-plot/cal-plot.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HorizonPlotComponent } from './components/horizon-plot/horizon-plot.component';
import { MatrixPlotComponent } from './components/matrix-plot/matrix-plot.component';
import { FileUploadComponent } from './components/file-upload/file-upload.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import {MatToolbarModule} from "@angular/material/toolbar";
import {MatIconModule} from "@angular/material/icon";
import {MatButtonModule} from "@angular/material/button";
import {MatTableModule} from "@angular/material/table";

@NgModule({
  declarations: [
    AppComponent,
    CalPlotComponent,
    HorizonPlotComponent,
    MatrixPlotComponent,
    FileUploadComponent,
    NavbarComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MatToolbarModule,
    MatButtonModule,
    MatTableModule,
    MatIconModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
