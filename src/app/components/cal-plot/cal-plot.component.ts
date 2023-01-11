import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import {Globals} from "../../globals";

@Component({
  selector: 'app-cal-plot',
  templateUrl: './cal-plot.component.html',
  styleUrls: ['./cal-plot.component.scss']
})
export class CalPlotComponent implements OnInit {

  data: any[] = Globals.data;

  constructor() {

  }

  ngOnInit(): void {
  }


}
