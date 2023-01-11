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

  private data1 = [
    {"date":"2015-12-20","value":"19"},
    {"date":"2015-12-21","value":"18"},
    {"date":"2015-12-22","value":"25"},
    {"date":"2015-12-23","value":"28"}
  ];
  private svg: any;
  private margin = 50;

  private year = 2015;
  private width = 750 - (this.margin * 2);
  private height = 400 - (this.margin * 2);


  constructor() {

  }

  ngOnInit(): void {
    this.createSvg();
    this.drawGraph(this.data1);
  }

  private createSvg(): void {
    this.svg = d3.select("figure#cal")
      .append("svg")
      .attr("width", this.width + (this.margin * 2))
      .attr("height", this.height + (this.margin * 2))
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawGraph(data: any[]): void {
    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map(d => d.Framework))
      .padding(0.2);

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, 200000])
      .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append("g")
      .call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d: any) => x(d.Framework))
      .attr("y", (d: any) => y(d.Stars))
      .attr("width", x.bandwidth())
      .attr("height", (d: any) => this.height - y(d.Stars))
      .attr("fill", "#d04a35");
  }

}
