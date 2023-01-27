import {AfterViewInit, Component, DoCheck, Input, OnChanges, OnInit} from '@angular/core';
import * as d3 from "d3";

@Component({
  selector: 'app-matrix',
  templateUrl: './matrix.component.html',
  styleUrls: ['./matrix.component.scss']
})
export class MatrixComponent implements OnInit, OnChanges {

  @Input() year1: any;

  @Input() year2: any;

  @Input() width: any;

  @Input() height: any;

  svg: any;
  year1old: any;
  year2old: any;

  private margin = 13;
  private tooltip: any;
  constructor() { }

  ngOnInit(): void {
    if(this.width && this.height) {
      this.createSvg();
      this.drawMatrix(this.year1, this.year2);
      this.year1old = this.year1;
      this.year2old = this.year2;
    }
  }

  ngOnChanges(): void {
    if(this.width && this.height) {
      if(this.year1old !== this.year1 || this.year2old !== this.year2) {
        this.createSvg();
        this.drawMatrix(this.year1, this.year2);
        this.year1old = this.year1;
        this.year2old = this.year2;
      }
    }
  }

  createTooltip() {
    this.tooltip = d3.select("#tooltip")
      .style("position", "absolute")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "2px")
      .style("border-radius", "5px")
      .style("padding", "5px");
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
    this.createTooltip();
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

    year1.map((d, i) => {
      year2.map((e, j) => {
        let tooltipText = "X-Week:"+ e.week + "\n Y-Week:"+ d.week +"\n X-Value:" +e.value +"\n X-Value:" +d.value;
        // @ts-ignore
        var color = d3.scaleLinear().domain([(d.value + 1)*-1, 0, e.value +1]).range(["#d03535", "#fff", "#3559d0"])
        this.svg.append("rect")
          .attr("x", x(e.week))
          .attr("y", y(d.week))
          .attr("width", x.bandwidth())
          .attr("height", y.bandwidth())
          .style("fill", color(e.value - d.value))
          .style("stroke", "black")
          .style("stroke-width", (e.week === d.week) ? 3 : 1)
          /*.on("mouseover", function (event, d) {
            d3.select(this).attr('stroke-width', "1px");
            d3.select('#tooltip').transition().duration(100).style('opacity', 1).text(tooltipText);
          })
          .on("mouseout", function (d) {
            d3.select(this).attr('stroke-width', "0.3px");
            d3.select('#tooltip').style('opacity', 0);
          })
          .on('mousemove', function(event, d) {
            d3.select('#tooltip')
              .style('left', (d3.pointer(event)[0]+10) + 'px')
              .style('top', (d3.pointer(event)[1]+10 ) + 'px')
          })*/;
      });
    });

  }
}
