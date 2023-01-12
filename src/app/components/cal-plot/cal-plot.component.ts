import { Component, OnInit } from '@angular/core';
import * as d3 from 'd3';
import {Globals} from "../../globals";
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-cal-plot',
  templateUrl: './cal-plot.component.html',
  styleUrls: ['./cal-plot.component.scss']
})
export class CalPlotComponent implements OnInit {

  private years: any[] = [];

  private curYear: any;

  private svg: any;
  private width = 960;
  private height = 136;
  private cellSize: number = 17;



  constructor(public dataService: DataService) {
  }

  ngOnInit(): void {
    this.years = this.dataService.createData(Globals.data);
    this.curYear = 0;
    this.createGraph();
  }
  nextYear() {
    this.curYear++;
    if (this.curYear < this.years.length) {
      this.createGraph();
    } else {
      this.curYear--;
    }
  }

  prevYear() {
    this.curYear--;
    if (this.curYear >= 0) {
      this.createGraph();
    } else {
      this.curYear++;
    }
  }

  getYear() {
    return this.years[this.curYear].key;
  }



  createGraph() {
    console.log(this.years[this.curYear].values);
    this.svg = d3.select("#svg").attr("width", this.width).attr("height", this.height);
    this.svg.selectAll("*").remove();
    const year = this.svg.append("g")
      .attr("transform",  "translate(" + ((this.width - this.cellSize * 53) / 2) + "," + (this.height - this.cellSize * 7 - 1) + ")");

    let max = Math.max(...this.years[this.curYear].values.map(d => d.value));
    // @ts-ignore
    let color = d3.scaleLinear().domain([0,(max-(max/3))]).range(["white", "green"])

    year
      .append("g")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.3px")
      .selectAll("rect")
      .data(this.years[this.curYear].values)
      .join("rect")
      .attr("width", this.cellSize)
      .attr("height", this.cellSize )
      .attr("x", d => d3.timeMonday.count(d3.timeYear(d.date), d.date) * this.cellSize)
      .attr("y", d => d.date.getUTCDay() * this.cellSize)
      .attr("fill", d => color(d.value))
      .on("mouseover", function () {
        d3.select(this).attr('stroke-width', "1px");
      })
      .on("mouseout", function () {
        d3.select(this).attr('stroke-width', "0.3px");
      })
      .append("title")
      .text(d => (d.date.getMonth() + 1) + "/" + d.date.getDate() + "/" + d.date.getFullYear() + ": " + d.value);

    year
      .append("g")
      .attr("text-anchor", "end")
      .selectAll("text")
      .data(d3.range(7).map(i => new Date(1995, 0, i)))
      .join("text")
      .attr("x", -5)
      .attr("y", ((d: any) => (d.getUTCDay() + 0.5) * this.cellSize))
      .attr("dy", "0.31em")
      .attr("font-size", 12)
      .text(d => ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][d.getUTCDay()]);

    year.append("g")
      .attr("fill", "none")
      .attr("stroke", "#000")
      .attr("stroke-width", "1.5px")
      .selectAll("path")
      .data(d3.timeMonths(new Date(this.getYear(), 0, 1), new Date(Number(this.getYear()) + 1, 0, 1)))
      .enter().append("path")
      .attr("d", function (d) {
        const cellSize = 17;
        const t1 = new Date(d.getFullYear(), d.getMonth() + 1, 0);
        const  d0 = d.getUTCDay();
        const  w0 = d3.timeMonday.count(d3.timeYear(d), d);
        const  d1 = t1.getUTCDay();
        const w1 = d3.timeMonday.count(d3.timeYear(t1), t1);
        return "M" + ((w0 + 1) * cellSize) + "," + (d0 * cellSize )
          + "H" + (w0 * cellSize) + "V" + (7 * cellSize)
          + "H" + (w1 * cellSize) + "V" + ((d1 + 1) * cellSize)
          + "H" + ((w1 + 1) * cellSize) + "V" + 0
          + "H" + ((w0 + 1) * cellSize) + "Z";
      });

    let month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    var legend = year.selectAll(".legend")
      .data(month)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + (30 + i*78) + ",0)"; });

    legend.append("text")
      .attr("class", function(d,i){ return month[i] })
      .style("text-anchor", "end")
      .attr("dy", "-.25em")
      .text(function(d,i){ return month[i] });
  }

}
