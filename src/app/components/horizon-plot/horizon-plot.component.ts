import { Component, OnInit } from '@angular/core';
import {Globals} from "../../globals";

@Component({
  selector: 'app-horizon-plot',
  templateUrl: './horizon-plot.component.html',
  styleUrls: ['./horizon-plot.component.scss']
})
export class HorizonPlotComponent implements OnInit {

  data: any[] = Globals.data;

  constructor() { }

  ngOnInit(): void {
  }

}
