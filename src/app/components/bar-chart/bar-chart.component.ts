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
  private margin = 13;
  constructor() { }

  ngOnInit(): void {
  }

  ngAfterViewInit(): void {
    if(this.width && this.height) {
      this.createSvg();
      if(this.indicator === 1) {
        this.drawhorizontalBars(this.data);
      } else {
        this.drawBars(this.data);
      }
    }
  }

  ngDoCheck(): void {
    if(this.width && this.height) {
    this.createSvg();
    if(this.indicator === 1) {
      this.drawhorizontalBars(this.data);
    } else {
      this.drawBars(this.data);
    }
    }
  }


  private createSvg(): void {
    if(this.indicator === 1) {
      this.svg = d3.select("#svg"+this.indicator)
        .attr("width", this.width + (this.margin * 2))
        .attr("height", this.height + (this.margin * 2));
    } else {
      this.svg = d3.select("#svg" + this.indicator)
        .attr("width", this.width)
        .attr("height", this.height);
    }
    this.svg.selectAll("*").remove();
    this.svg = this.svg
      .append("g")
      .attr("transform", "translate(" + (this.margin*2) + "," + (this.margin*2) + ")");
  }



  private drawBars(data: any[]): void {
    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, (this.width - (this.margin * 2))])
      .domain(data.map(d => d.week));

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0,0)")
      .call(d3.axisTop(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(45)")
      .style("text-anchor", "end");

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d.value))])
      .range([(this.height - (this.margin * 2)), 0]);

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
      .attr("height", (d: any) => (this.height - (this.margin * 2)) - y(d.value))
      .attr("fill", this.color);
  }

  private drawhorizontalBars(data: any[]): void {
    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, (this.height - (this.margin * 2))])
      .domain(data.map(d => d.week));

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d.value))])
      .range([(this.width - (this.margin * 2)), 0]);

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0,0)")
      .call(d3.axisTop(y))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(45)")
      .style("text-anchor", "end");


    // Draw the Y-axis on the DOM
    this.svg.append("g")
      .call(d3.axisLeft(x));

    // Create and fill the bars
    this.svg.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("y", (d: any) => x(d.week))
      .attr("x", (d: any) => y(d.value))
      .attr("height", x.bandwidth())
      .attr("width", (d: any) => (this.height - (this.margin * 2)) - y(d.value))
      .attr("fill", this.color);
  }



}
