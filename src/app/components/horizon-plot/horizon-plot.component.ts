import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-horizon-plot',
  templateUrl: './horizon-plot.component.html',
  styleUrls: ['./horizon-plot.component.scss']
})
export class HorizonPlotComponent implements OnInit {

  data: any[];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.data = this.dataService.createData(this.dataService.getData());
    this.createHorizonChart(this.data[0].values);
  }


  createHorizonChart(data) {
    data = this.dataService.getDataFFM(data);
    const width = 800;
    const height = 500;

    let svg = d3.select("#svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

    svg = svg
      .append("g")
      .attr("transform", "translate(0,0)");

    const xScale = d3.scaleUtc([data[0].date, data[data.length - 1].date], [0, width]);
    const yScale = d3.scaleLinear([Math.min(...data.map(d => d.form)), Math.max(...data.map(d => d.form))], [height, 0]);

    svg.append("g")
      .attr("transform", "translate(50,"+ height +")")
      .call(d3.axisBottom(xScale))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(45)")
      .style("text-anchor", "end");

    svg.append("g")
      .attr("transform", "translate(50,0)")
      .call(d3.axisLeft(yScale));

    svg.append("path")
      .datum(data)
      .attr("fill", "#cce5df")
      .attr("stroke", "#69b3a2")
      .attr("stroke-width", 1.5)
      .attr("d", d3.area()
        .x((d: any) => xScale(d.date))
        .y0(yScale(0))
        .y1((d: any) => yScale(d.form))
      )

  }
}
