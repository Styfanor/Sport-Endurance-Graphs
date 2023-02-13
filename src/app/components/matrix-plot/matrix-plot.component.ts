import {Component, DoCheck, OnInit} from '@angular/core';
import {DataService} from "../../services/data.service";
import {ResizedEvent} from "angular-resize-event";
import * as d3 from "d3";
import * as d3col from "d3-collection";

@Component({
  selector: 'app-matrix-plot',
  templateUrl: './matrix-plot.component.html',
  styleUrls: ['./matrix-plot.component.scss']
})
export class MatrixPlotComponent implements OnInit {


  rawdata: any;
  data: any[];
  year1: any;

  year2: any;
  matrixsize: any = 800;

  height: any = 150;

  margin = 13;

  svgMatrix: any;

  svgVertical: any;

  svgHorizontal: any;

  tooltip: any


  metrics: any[] = [
    {name: 'Relative Effort', value: 'RelativeEffort'},
    {name: 'Distance', value: 'Distance'},
    {name: 'Total Duration', value: 'ElapsedTime'},
    {name: 'Moving Duration', value: 'MovingTime'}
  ];
  selected: any = 'RelativeEffort';

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.rawdata = this.dataService.createData(this.dataService.getData(), this.selected);
    this.data = d3col.nest().key(function (d: any) {
      return d.date.getFullYear()
    }).entries(this.rawdata);
    this.year1 = this.data[0].key;
    this.year2 = this.data[0].key;
    this.createSvgHoriziontal();
    this.createSvgVertical();
    this.createSvgMatrix();
    this.drawVerticalBars(this.getYearData(this.year1));
    this.drawHorizontalBars(this.getYearData(this.year2));
    this.drawMatrix(this.getYearData(this.year1), this.getYearData(this.year2));
  }

  changeSelect():void {
    this.rawdata = this.dataService.createData(this.dataService.getData(), this.selected);
    this.data = d3col.nest().key(function (d: any) {
      return d.date.getFullYear()
    }).entries(this.rawdata);
    this.changeYear();
  }

  getYearData(year) {
    return this.dataService.groupDataByWeek(this.data.filter(d => d.key === year)[0].values);
  }

  private createSvgHoriziontal(): void {
      this.svgHorizontal = d3.select("#horizontal")
        .attr("width", "100%")
        .attr("viewBox", [0, 0, this.matrixsize + (this.margin * 2), this.height + (this.margin * 2)]);
    this.svgHorizontal.selectAll("*").remove();
    this.svgHorizontal = this.svgHorizontal
      .append("g")
      .attr("transform", "translate(" + (this.margin*2) + "," + (this.margin*2) + ")");
  }

  private createSvgVertical(): void {
    this.svgVertical = d3.select("#vertical")
      .attr("height", "100%")
      .attr("viewBox", [0, 0, this.height + (this.margin * 2), this.matrixsize + (this.margin * 2)]);
    this.svgVertical.selectAll("*").remove();
    this.svgVertical = this.svgVertical
      .append("g")
      .attr("transform", "translate(" + (this.margin*2) + "," + (this.margin*2) + ")");
  }

  private drawHorizontalBars(data: any[]): void {
    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, (this.matrixsize - (this.margin * 2))])
      .domain(data.map(d => d.week));

    // Draw the X-axis on the DOM
    this.svgHorizontal.append("g")
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
    this.svgHorizontal.append("g")
      .call(d3.axisLeft(y));

    // Create and fill the bars
    this.svgHorizontal.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d: any) => x(d.week))
      .attr("y", (d: any) => y(d.value))
      .attr("width", x.bandwidth())
      .attr("height", (d: any) => (this.height - (this.margin * 2)) - y(d.value))
      .attr("fill", "#3559d0");
  }

  private drawVerticalBars(data: any[]): void {
    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, (this.matrixsize - (this.margin * 2))])
      .domain(data.map(d => d.week));

    // Create the Y-axis band scale
    const y = d3.scaleLinear()
      .domain([0, Math.max(...data.map(d => d.value))])
      .range([(this.height - (this.margin * 2)), 0]);

    // Draw the X-axis on the DOM
    this.svgVertical.append("g")
      .attr("transform", "translate(0,0)")
      .call(d3.axisTop(y))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(45)")
      .style("text-anchor", "end");


    // Draw the Y-axis on the DOM
    this.svgVertical.append("g")
      .call(d3.axisLeft(x));

    // Create and fill the bars
    this.svgVertical.selectAll("bars")
      .data(data)
      .enter()
      .append("rect")
      .attr("y", (d: any) => x(d.week))
      .attr("x", (d: any) => y(d.value))
      .attr("height", x.bandwidth())
      .attr("width", (d: any) => (this.height - (this.margin * 2)) - y(d.value))
      .attr("fill", "#d03535");
  }


  createTooltip() {
    this.tooltip = d3.select("#tooltip")
      .style("opacity", 0)
      .style("padding", "5px");
  }

  private createSvgMatrix(): void {
    this.svgMatrix = d3.select("#matrix")
      .attr("width", "100%")
      .attr("viewBox", [0, 0, this.matrixsize + (this.margin * 2), this.matrixsize + (this.margin * 2)])
    this.svgMatrix.selectAll("*").remove();
    this.svgMatrix = this.svgMatrix
      .append("g")
      .attr("transform", "translate(" + (this.margin*2) + "," + (this.margin*2) + ")");
  }

  private drawMatrix(year1, year2): void {
    this.createTooltip();
    // Create the X-axis band scale
    const x = d3.scaleBand()
      .range([0, (this.matrixsize - (this.margin * 2))])
      .domain(year2.map(d => d.week));

    // Draw the X-axis on the DOM
    this.svgMatrix.append("g")
      .attr("transform", "translate(0,0)")
      .call(d3.axisTop(x))
      .selectAll("text")
      .attr("transform", "translate(-10,0)rotate(45)")
      .style("text-anchor", "end");

    // Create the Y-axis band scale
    const y = d3.scaleBand()
      .range([(this.matrixsize - (this.margin * 2)), 0])
      .domain(year1.slice(0).reverse().map(d => d.week));
    ;

    // Draw the Y-axis on the DOM
    this.svgMatrix.append("g")
      .call(d3.axisLeft(y));

    year1.map((d, i) => {
      year2.map((e, j) => {
        // @ts-ignore
        var color = d3.scaleLinear().domain([(d.value + 1)*-1, 0, e.value +1]).range(["#d03535", "#fff", "#3559d0"])
        this.svgMatrix.append("rect")
          .attr("x", x(e.week))
          .attr("y", y(d.week))
          .attr("width", x.bandwidth())
          .attr("height", y.bandwidth())
          .style("fill", color(e.value - d.value))
          .style("stroke", "black")
          .style("stroke-width", (e.week === d.week) ? "2px" : "0.5px")
        .on("mouseover", function (event, c) {
          d3.select(this).attr('stroke-width', "4px");
          d3.select('#tooltip').transition().duration(100).style('opacity', 1);
          d3.select('#tooltip').select('#xweek').text("X-Week: " + e.week);
          d3.select('#tooltip').select('#yweek').text("Y-Week: " + d.week);
          d3.select('#tooltip').select('#xvalue').text("X-Value: " + e.value);
          d3.select('#tooltip').select('#yvalue').text("Y-Value: " + d.value);
        })
        .on("mouseout", function (d) {
          d3.select(this).attr('stroke-width', "0.5px");
          d3.select('#tooltip').style('opacity', 0);
        });
      });
    });
  }

  changeYear() {
    this.createSvgHoriziontal();
    this.createSvgVertical();
    this.createSvgMatrix();
    this.drawVerticalBars(this.getYearData(this.year1));
    this.drawHorizontalBars(this.getYearData(this.year2));
    this.drawMatrix(this.getYearData(this.year1), this.getYearData(this.year2));
  }
}
