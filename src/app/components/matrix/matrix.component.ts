import {AfterViewInit, Component, DoCheck, Input, OnInit} from '@angular/core';
import * as d3 from "d3";

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent implements AfterViewInit, DoCheck {

  @Input() year1: any;

  @Input() year2: any;

  @Input() width: any;

  @Input() height: any;

  svg: any;

  private margin = 13;
  constructor() { }

  ngAfterViewInit(): void {
    if(this.width && this.height) {
      this.createSvg();
      this.drawMatrix(this.year1, this.year2);
    }
  }

  ngDoCheck(): void {
    if(this.width && this.height) {
      this.createSvg();
      this.drawMatrix(this.year1, this.year2);
    }
  }

  private createSvg(): void {
    this.svg = d3.select("#matrix")
        .attr("width", this.width + (this.margin * 2))
        .attr("height", this.height + (this.margin * 2));
    this.svg.selectAll("*").remove();
    this.svg = this.svg
      .append("g")
      .attr("transform", "translate(" + (this.margin*2) + "," + (this.margin*2) + ")");
  }

  private drawMatrix(year1, year2): void {
    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, (this.width - (this.margin * 2))])
      .domain(year2.map(d => d.week));

    // Draw the X-axis on the DOM
    this.svg.append("g")
      .attr("transform", "translate(0,0)")
      .call(d3.axisTop(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(45)")
      .style("text-anchor", "end");

    // Create the Y-axis band scale
    const y = d3.scaleBand()
      .range([(this.height - (this.margin * 2)), 0])
      .domain(year1.slice(0).reverse().map(d => d.week));
    ;

    // Draw the Y-axis on the DOM
    this.svg.append("g")
      .call(d3.axisLeft(y));


    let maxyear1 = 0-Math.max(...year1.map(d => d.value));
    let maxyear2 = Math.max(...year2.map(d => d.value));

    // @ts-ignore
    var color = d3.scaleLinear().domain([maxyear1, 0, maxyear2]).range(["#d03535", "#fff", "#3559d0"])

    year1.map((d, i) => {
      year2.map((e, j) => {
        this.svg.append("rect")
          .attr("x", x(e.week))
          .attr("y", y(d.week))
          .attr("width", x.bandwidth())
          .attr("height", y.bandwidth())
          .style("fill", color(e.value - d.value))
          .style("stroke", "black")
          .style("stroke-width", 0.1);
      });
    });

  }
}
