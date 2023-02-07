import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
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
  metrics: any[] = [
    {name: 'Relative Effort', value: 'RelativeEffort'},
    {name: 'Distance', value: 'Distance'},
    {name: 'Total Duration', value: 'ElapsedTime'},
    {name: 'Moving Duration', value: 'MovingTime'}
  ];
  selected: any = 'RelativeEffort';

  tooltip: any;

  yearsList: any;

  selectedYears = [0];


  constructor(public dataService: DataService) {
}

  ngOnInit(): void {
    this.years = this.dataService.createData(this.dataService.getData(), this.selected);
    this.yearsList = this.years.map(year => year.key);
    this.createSvg();
    this.selectedYears.forEach((year, index) => {
      this.createGraph(year, index);
    });
  }

  changeYears(){
    this.createSvg();
    this.selectedYears.forEach((year, index) => {
      this.createGraph(year , index);
    });
  }

  changeSelect():void {
    this.createSvg();
    this.years = this.dataService.createData(this.dataService.getData(), this.selected);
    this.selectedYears.forEach((year, index) => {
      this.createGraph(year, index);
    });
  }

  getYear(curYear: any) {
    return this.years[curYear].key;
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

  createSvg(){
    this.svg = d3.select("#svg").attr("width", this.width).attr("height", this.height * this.selectedYears.length);
    this.svg.selectAll("*").remove();
    this.createTooltip();
  }

  createGraph(curYear, index) {
    const year = this.svg.append("g")
      .attr("transform",  "translate(" + ((this.width - this.cellSize * 53) / 2) + "," + (this.height * (index+1) - this.cellSize * 7 - 1) + ")");

    year.append("text")
      .attr("transform", "translate(930," + this.cellSize * 3.5 + ")rotate(-90)")
      .style("text-anchor", "middle")
      .text(this.getYear(curYear));

    let max = Math.max(...this.years[curYear].values.map(d => d.value));
    // @ts-ignore
    let color = d3.scaleLinear().domain([0,(max-(max/3))]).range(["white", "green"])

    year
      .append("g")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.3px")
      .selectAll("rect")
      .data(this.years[curYear].values)
      .join("rect")
      .attr("width", this.cellSize)
      .attr("height", this.cellSize )
      .attr("x", d => d3.timeMonday.count(d3.timeYear(d.date), d.date) * this.cellSize)
      .attr("y", d => d.date.getUTCDay() * this.cellSize)
      .attr("fill", d => color(d.value))
      .on("mouseover", function (event, d) {
        d3.select(this).attr('stroke-width', "1px");
        d3.select('#tooltip').transition().duration(100).style('opacity', 1).text("Date:"+ d.date.getFullYear() +"-"+ (d.date.getMonth()+1) +"-"+ d.date.getDate() +"Value:" +d.value);
      })
      .on("mouseout", function (d) {
        d3.select(this).attr('stroke-width', "0.3px");
        d3.select('#tooltip').style('opacity', 0);
      })
      .on('mousemove', function(event, d) {
        d3.select('#tooltip')
          .style('left', (d3.pointer(event,year)[0]+10) + 'px')
          .style('top', (d3.pointer(event,year)[1]+10 ) + 'px')
      });

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
      .data(d3.timeMonths(new Date(this.getYear(curYear), 0, 1), new Date(Number(this.getYear(curYear)) + 1, 0, 1)))
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
