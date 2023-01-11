import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {FileUploadComponent} from "./components/file-upload/file-upload.component";
import {CalPlotComponent} from "./components/cal-plot/cal-plot.component";
import {HorizonPlotComponent} from "./components/horizon-plot/horizon-plot.component";
import {MatrixPlotComponent} from "./components/matrix-plot/matrix-plot.component";

const routes: Routes = [
  {path: '', component: FileUploadComponent},
  {path: 'cal', component: CalPlotComponent},
  {path: 'horizon', component: HorizonPlotComponent},
  {path: 'matrix', component: MatrixPlotComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
