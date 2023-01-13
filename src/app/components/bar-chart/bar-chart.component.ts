import {AfterViewInit, Component, DoCheck, Input, OnInit} from '@angular/core';
import * as d3 from 'd3';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss']
})
export class BarChartComponent implements OnInit, AfterViewInit, DoCheck {

  @Input() data: any;
  @Input() indicator: number;
  @Input() color: any;
  @Input() width;
  @Input() height;

  private svg: any;
  private margin = 50;
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    this.createSvg();
    this.drawBars(this.data);
  }

  ngDoCheck(): void {
    this.createSvg();
    this.drawBars(this.data);
  }


  private createSvg(): void {
    if(this.indicator === 1) {
      this.svg = d3.select("#svg"+this.indicator)
        .attr("width", this.width + (this.margin * 2))
        .attr("height", this.height + (this.margin * 2))
        .attr("transform", "rotate(270)");
    } else {
      this.svg = d3.select("#svg" + this.indicator)
        .attr("width", this.width)
        .attr("height", this.height);
    }
    this.svg.selectAll("*").remove();
    this.svg = this.svg
      .append("g")
      .attr("transform", "translate(" + this.margin + "," + this.margin + ")");
  }

  private drawBars(data: any[]): void {
    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, this.width])
      .domain(data.map(d => d.week));

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0," + this.height + ")")
      .call(d3.axisBottom(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(-45)")
      .style("text-anchor", "end");

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d.value))])
      .range([this.height, 0]);

    // Draw the Y-axis on the DOM
    this.svg.append("g")
      .call(d3.axisLeft(y));

    // Create and fill the bars
    this.svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d: any) => x(d.week))
      .attr("y", (d: any) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d: any) => this.height - y(d.value))
      .attr("fill", this.color);
  }



}
