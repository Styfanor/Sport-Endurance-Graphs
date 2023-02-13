import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {DataService} from "../../services/data.service";
import * as d3col from "d3-collection";

@Component({
  selector: 'app-cal-plot',
  templateUrl: './cal-plot.component.html',
  styleUrls: ['./cal-plot.component.scss']
})
export class CalPlotComponent implements OnInit {

  private data: any[] = [];

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

  yearsListRaces = [];

  selectedYears = [0];
  raceday = [""];

  newYears = [];


  constructor(public dataService: DataService) {
}

  ngOnInit(): void {
    this.data = this.dataService.createData(this.dataService.getData(), this.selected);
    this.years = d3col.nest().key(function (d: any) {
      return d.date.getFullYear()
    }).entries(this.data);
    this.createRaceList();
    this.createSvg();
    this.years.forEach((year) => {
      this.newYears.push(year.values);
    });
    this.selectedYears.forEach((year, index) => {
      this.createGraph(year, index, this.newYears[year]);
    });
  }

  changeYears(){
    this.createSvg();
    this.raceday = [];
    this.years.forEach((year, index) => {
      this.newYears[index] = year.values;
    });
    this.selectedYears.forEach((year, index) => {
      this.raceday.push("");
      this.createGraph(year , index, this.newYears[year]);
    });
    this.createRaceList();
  }

  changeSelect():void {
    this.createSvg();
    this.data = this.dataService.createData(this.dataService.getData(), this.selected);
    this.years = d3col.nest().key(function (d: any) {
      return d.date.getFullYear()
    }).entries(this.data);
    this.years.forEach((year, index) => {
      this.newYears[index] = year.values;
    });
    this.yearsListRaces.forEach((year, index) => {
      this.shift(index, year.name);
    });
  }

  getYear(curYear: any) {
    return this.years[curYear].key;
  }

  createRaceList() {
    this.yearsListRaces = [];
    this.yearsList = this.years.map(year => year.key);
    this.years.forEach((year, index) => {
      if(this.selectedYears.includes(index)) {
        let data = {name: year.key, values: []};
        data.values.push({date: new Date(year.key, 6, 3), name: "none"});
        year.values.forEach(training => {
          if (training.race) {
            let value = {date: training.date, name: training.name}
            data.values.push(value);
          }
        });
        this.yearsListRaces.push(data);
      }
    });
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

  createGraph(curYear, index, yeardata) {
    const year = this.svg.append("g")
      .attr("transform",  "translate(" + ((this.width - this.cellSize * 53) / 2) + "," + (this.height * (index+1) - this.cellSize * 7 - 1) + ")");

    year.append("text")
      .attr("transform", "translate(930," + this.cellSize * 3.5 + ")rotate(-90)")
      .style("text-anchor", "middle")
      .text(this.getYear(curYear));

    let max = Math.max(...yeardata.map(d => d.value));
    // @ts-ignore
    let color = d3.scaleLinear().domain([0,(max-(max/3))]).range(["white", "green"])

    year
      .append("g")
      .attr("stroke", "#000")
      .attr("stroke-width", "0.3px")
      .selectAll("rect")
      .data(yeardata)
      .join("rect")
      .attr("width", this.cellSize)
      .attr("height", this.cellSize )
      .attr("x", d => Math.floor((yeardata.findIndex(e => e.date === d.date)/7)) * this.cellSize)
      .attr("y", d => (yeardata.findIndex(e => e.date === d.date)%7) * this.cellSize)
      .attr("fill", d => (d.race ? "#ff0000" : color(d.value)))
      .on("mouseover", function (event, d) {
        d3.select(this).attr('stroke-width', "1px");
        d3.select('#tooltip').transition().duration(100).style('opacity', 1).text("Date: "+ d.date.getFullYear() +"-"+ (d.date.getMonth()+1) +"-"+ d.date.getDate() +" Value: " +d.value + " Name: " + d.name);
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
      .data(d3.range(7).map(i => new Date(yeardata[i].date.getFullYear(), yeardata[i].date.getMonth(), yeardata[i].date.getDate())))
      .join("text")
      .attr("x", -5)
      .attr("y", ((d: any, index:any) => (index + 0.5) * this.cellSize))
      .attr("dy", "0.31em")
      .attr("font-size", 12)
      .text(d => ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"][d.getUTCDay()]);

    let monthindex = [];
    yeardata.forEach(d => {
      if (monthindex.findIndex(m => m === d.date.getMonth()) === -1) {
        monthindex.push(d.date.getMonth())
      }
    });
    let month = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    let monthname = monthindex.map(d => month[d]);
    var legend = year.selectAll(".legend")
      .data(monthname)
      .enter().append("g")
      .attr("class", "legend")
      .attr("transform", function(d, i) { return "translate(" + (30 + i*78) + ",0)"; });

    legend.append("text")
      .attr("class", function(d,i){ return monthname[i] })
      .style("text-anchor", "end")
      .attr("dy", "-.25em")
      .text(function(d,i){ return monthname[i] });


  }

  shift(index, year) {
    let new_year = []
    let mid_index = this.data.findIndex(d => d.date.getTime() === new Date(this.raceday[index]).getTime());
    let start_index = mid_index - 183;
    let end_index = mid_index + 182;
    console.log(start_index);
    console.log(end_index);
    while(start_index < 0) {
      let temp = {
        date: new Date(this.data[0].date),
        value: 0,
        race: false,
        week: 0,
        name: ""
      }
      temp.date.setDate(temp.date.getDate() + start_index);
      new_year.push(temp);
      start_index++;
    }
    if(end_index < this.data.length) {
      for (let i = start_index; i < end_index; i++) {
        new_year.push(this.data[i]);
      }
    } else {
      for (let i = start_index; i < this.data.length; i++) {
        new_year.push(this.data[i]);
      }
    }
    while(end_index > this.data.length) {
      let temp = {
        date: new Date(this.data[this.data.length-1].date),
        value: 0,
        week: 0,
        name: ""
      }
      temp.date.setDate(temp.date.getDate() + end_index-this.data.length);
      new_year.push(temp);
      end_index--;
    }
    let idx = this.years.findIndex(d => d.key === year);
    this.newYears[idx] = new_year;
    this.createSvg();
    this.selectedYears.forEach((year, i) => {
      this.createGraph(year, i, this.newYears[year]);
    });
  }
}
