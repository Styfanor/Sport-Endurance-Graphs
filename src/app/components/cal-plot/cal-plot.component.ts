import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import * as d3col from 'd3-collection';
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
    this.createGraph();
  }

  createGraph() {
    const svg = d3.select("#svg");
    // @ts-ignore
    const { width, height } = document.getElementById("svg").getBoundingClientRect();
    // @ts-ignore
    const years = d3col.nest().key(d => d.ActivityDate.getFullYear()).entries(this.data);
    console.log(years);
  }


}
