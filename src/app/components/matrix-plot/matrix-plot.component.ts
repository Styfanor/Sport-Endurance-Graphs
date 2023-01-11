import { Component, OnInit } from '@angular/core';
import {Globals} from "../../globals";
@Component({
  selector: 'app-matrix-plot',
  templateUrl: './matrix-plot.component.html',
  styleUrls: ['./matrix-plot.component.scss']
})
export class MatrixPlotComponent implements OnInit {

  data: any[] = Globals.data;

  constructor() { }

  ngOnInit(): void {
  }

}
