import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-horizon-plot',
  templateUrl: './horizon-plot.component.html',
  styleUrls: ['./horizon-plot.component.scss']
})
export class HorizonPlotComponent implements OnInit {

  years: any[];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.years = this.dataService.createData(this.dataService.getData());
    this.createHorizonChart(this.years);
  }


  createHorizonChart(data) {
    const marginTop = 20;
    const width = 640; // outer width, in pixels
    const size = 25; // outer height of a single horizon, in pixels
    const height = data.length * size + marginTop;

    const svg = d3.select("#svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

    data.forEach((d, i) => {
      svg.append("g")
        .attr("transform", "translate(0," + (i * size)+ ")");
    });
  }
}
