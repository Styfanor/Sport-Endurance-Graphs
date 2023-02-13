import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {DataService} from "../../services/data.service";
import * as d3col from "d3-collection";

@Component({
  selector: 'app-horizon-plot',
  templateUrl: './horizon-plot.component.html',
  styleUrls: ['./horizon-plot.component.scss']
})
export class HorizonPlotComponent implements OnInit {

  data: any[];

  years: any[];
  selected = "form";

  ff = [
    {name: 'Form', value: 'form'},
    {name: 'Fitness', value: 'fit'},
    {name: 'Fatigue', value: 'fat'}
  ]

  width = 1000;
  height = 100;

  yearsList: any;

  selectedYears = [0];

  svg: any;

  focuses: any[] = [];

  datafocus: any[]= [];

  xScales: any[]= [];

  yScales: any[]= [];

  bisectDates: any[]= [];
  yearsListRaces = [];

  raceday = [""];

  newYears = [];

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.data = this.dataService.createData(this.dataService.getData(), 'RelativeEffort');
    this.years = d3col.nest().key(function (d: any) {
      return d.date.getFullYear()
    }).entries(this.data);
    this.yearsList = this.years.map(year => year.key);
    this.createRaceList();
    this.createSvg();
    this.years.forEach((year) => {
      this.newYears.push(year.values);
    });
    this.selectedYears.forEach((year, index) => {
      this.createHorizonChart(this.newYears[year], this.selected, index);
    });
    this.addTooltip();
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

  changeYears(){
    this.createSvg();
    this.raceday = [];
    this.years.forEach((year, index) => {
      this.newYears[index] = year.values;
    });
    this.selectedYears.forEach((year, index) => {
      this.raceday.push("");
      this.createHorizonChart(this.newYears[year], this.selected, index);
    });
    this.createRaceList();
    this.addTooltip();
  }

  findMax(years, label) {
    let max = 0;
    years.forEach((year, i) => {
      let data = this.dataService.getDataFFM(year.values);
      max = Math.max(max, Math.max(...data.map(d => d[label])));
    });
    return max;
  }

  findMin(years, label) {
    let min = 0;
    years.forEach((year, i) => {
      let data = this.dataService.getDataFFM(year.values);
      min = Math.min(min, Math.min(...data.map(d => d[label])));
    });
    return min;
  }

  createSvg(){
    this.svg = d3.select("#horizon")
      .attr("width", "100%")
      .attr("height", ((this.height+80)*this.selectedYears.length))
      .attr("viewBox", [0, 0, this.width+100, ((this.height+80)*this.selectedYears.length)])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

    this.svg.selectAll("*").remove();
  }

  createHorizonChart(year, label, index) {
    this.svg = d3.select("#horizon");
    let min = this.findMin(this.years, label);
    let max = this.findMax(this.years, label);

      this.svg = this.svg.append("g")
        .attr("transform", `translate(50,${(index*(this.height+20))+30})`);

      let data = this.dataService.getDataFFM(year);

      const xScale = d3.scaleUtc([data[0].date, data[data.length - 1].date], [0, this.width]);
      const yScale = d3.scaleLinear([min, max+10], [this.height, 0]);

      this.svg.append("g")
        .call(d3.axisTop(xScale))
        .selectAll("text")
        .style("text-anchor", "end");

    this.svg.append("g")
        .call(d3.axisLeft(yScale));

      let lineSvg = this.svg.append("g");

      let focus = this.svg.append("g")
        .style("display", "none");

      let bisectDate = d3.bisector(function(d) { // @ts-ignore
        return d.date; }).left;

      // append the x line
      focus.append("line")
        .attr("class", "x")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", this.height);

      // append the y line
      focus.append("line")
        .attr("class", "y")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("x1", this.width)
        .attr("x2", this.width);

      // place the value at the intersection
      focus.append("text")
        .attr("class", "y1")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "-.3em");
      focus.append("text")
        .attr("class", "y2")
        .attr("dx", 8)
        .attr("dy", "-.3em");

      // place the date at the intersection
      focus.append("text")
        .attr("class", "y3")
        .style("stroke", "white")
        .style("stroke-width", "3.5px")
        .style("opacity", 0.8)
        .attr("dx", 8)
        .attr("dy", "1em");
      focus.append("text")
        .attr("class", "y4")
        .attr("dx", 8)
        .attr("dy", "1em");

      this.focuses.push(focus);
      this.bisectDates.push(bisectDate);
      this.yScales.push(yScale);
      this.xScales.push(xScale);
      this.datafocus.push(data);

      // append the rectangle to capture mouse
      this.svg.append("rect")
        .attr("width", this.width)
        .attr("height", this.height)
        .style("fill", "none")
        .style("pointer-events", "all")

      if (label === "form") {

        lineSvg.append("path")
          .datum(data)
          .attr("fill", '#949494')
          .attr("stroke", "none")
          .attr("stroke-width", 1)
          .attr("d", d3.area()
            .x((d: any) => xScale(d.date))
            .y0(yScale(0))
            .y1((d: any) => {
              if (d.form <= 0) {
                return yScale(d.form)
              } else {
                return yScale(0)
              }
            })
          );

        // Optimal Training
        lineSvg.append("path")
          .datum(data)
          .attr("fill", '#52b254')
          .attr("stroke", "none")
          .attr("stroke-width", 1)
          .attr("d", d3.area()
            .x((d: any) => xScale(d.date))
            .y0(yScale(-10))
            .y1((d: any) => {
              if (-10 >= d.form) {
                return yScale(d.form)
              } else {
                return yScale(-10)
              }
            })
          );

        // High Risk
        lineSvg.append("path")
          .datum(data)
          .attr("fill", '#ef1717')
          .attr("stroke", "none")
          .attr("stroke-width", 1)
          .attr("d", d3.area()
            .x((d: any) => xScale(d.date))
            .y0(yScale(-30))
            .y1((d: any) => {
              if (d.form <= -30) {
                return yScale(d.form)
              } else {
                return yScale(-30)
              }
            })
          );

        // Grey Zone
        lineSvg.append("path")
          .datum(data)
          .attr("fill", '#949494')
          .attr("stroke", "none")
          .attr("stroke-width", 1)
          .attr("d", d3.area()
            .x((d: any) => xScale(d.date))
            .y0(yScale(0))
            .y1((d: any) => {
              if (d.form >= 0) {
                return yScale(d.form)
              } else {
                return yScale(0)
              }
            })
          );

        // Freshness Zone
        lineSvg.append("path")
          .datum(data)
          .attr("fill", '#1795ef')
          .attr("stroke", "none")
          .attr("stroke-width", 1)
          .attr("d", d3.area()
            .x((d: any) => xScale(d.date))
            .y0(yScale(5))
            .y1((d: any) => {
              if (5 <= d.form) {
                return yScale(d.form)
              } else {
                return yScale(5)
              }
            })
          );


        // Transitonal Zone
        lineSvg.append("path")
          .datum(data)
          .attr("fill", '#fc670d')
          .attr("stroke", "none")
          .attr("stroke-width", 1)
          .attr("d", d3.area()
            .x((d: any) => xScale(d.date))
            .y0(yScale(25))
            .y1((d: any) => {
              if (d.form >= 25) {
                return yScale(d.form)
              } else {
                return yScale(25)
              }
            })
          );

        lineSvg
          .append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "#000")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x((d: any) => xScale(d.date))
            .y((d: any) => yScale(d.form))
          );
      } else if (label === "fit")
      {
        lineSvg
          .append("path")
          .datum(data)
          .attr("fill", "#52b254")
          .attr("stroke", "#000")
          .attr("stroke-width", 1.5)
          .attr("d", d3.area()
            .x((d: any) => xScale(d.date))
            .y0(yScale(0))
            .y1((d: any) => yScale(d.fit))
          );
      } else {
        lineSvg
          .append("path")
          .datum(data)
          .attr("fill", "#ef1717")
          .attr("stroke", "#000")
          .attr("stroke-width", 1.5)
          .attr("d", d3.area()
            .x((d: any) => xScale(d.date))
            .y0(yScale(0))
            .y1((d: any) => yScale(d.fat))
          );
      }

      lineSvg.selectAll("dot")
        .data(data)
        .enter().append("circle")
        .attr("r", 3.5)
        .attr("cx", (d: any) => xScale(d.date))
        .attr("cy", (d: any) => yScale(d[label]))
        .attr("fill", (d: any) =>
          (d.race) ? "#ff0000" : "none"
        )
        .attr("stroke", (d: any) =>
          (d.race) ? "#000" : "none"
        );
  }

  showFocuses() {
    this.focuses.forEach((focus, index) => {
      focus.style("display", null);
    });
  }

  hideFocuses() {
    this.focuses.forEach((focus, index) => {
      focus.style("display", "none");
    });
  }

  mouseOverFocus(event, label) {
    this.focuses.forEach((focus, index) => {
      // @ts-ignore
      var x0 = this.xScales[index].invert(d3.pointer(event)[0]),
        i = this.bisectDates[index](this.datafocus[index], x0, 1),
        d0 = this.datafocus[index][i - 1],
        d1 = this.datafocus[index][i],
        // @ts-ignore
        d = x0 - d0.date > d1.date - x0 ? d1 : d0;

      focus.select("text.y1")
        .attr("transform",
          "translate(" + this.xScales[index](d.date) + "," +
          this.yScales[index](d[label]) + ")")
        .text("Value: " + Math.round(d[label]));

      focus.select("text.y2")
        .attr("transform",
          "translate(" + this.xScales[index](d.date) + "," +
          this.yScales[index](d[label]) + ")")
        .text("Value: " + Math.round(d[label]));

      focus.select("text.y3")
        .attr("transform",
          "translate(" + this.xScales[index](d.date) + "," +
          this.yScales[index](d[label]) + ")")
        .text(d.date.getFullYear() +"-"+ (d.date.getMonth()+1) +"-"+ d.date.getDate());

      focus.select("text.y4")
        .attr("transform",
          "translate(" + this.xScales[index](d.date) + "," +
          this.yScales[index](d[label]) + ")")
        .text(d.date.getFullYear() +"-"+ (d.date.getMonth()+1) +"-"+ d.date.getDate());

      focus.select(".x")
        .attr("transform",
          "translate(" + this.xScales[index](d.date) + "," +
          this.yScales[index](d[label]) + ")")
        .attr("y2", 100 - this.yScales[index](d[label]));

      focus.select(".y")
        .attr("transform",
          "translate(" + 1000 * -1 + "," +
          this.yScales[index](d[label]) + ")")
        .attr("x2", 1000 + 1000);
    });
  }

  addTooltip() {
    d3.select("#horizon")
      .on("mouseover", (i, n) => {
        this.showFocuses();
      })
      .on("mouseout", (i, n) => { this.hideFocuses();})
      .on("mousemove", (event) => { this.mouseOverFocus(event, this.selected);})
  }

  changeSelect() {
    this.createSvg();
    this.years.forEach((year, index) => {
      this.newYears[index] = year.values;
    });
    this.yearsListRaces.forEach((year, index) => {
      this.shift(index, year.name);
    });
    this.addTooltip();
  }

  shift(index, year) {
    let new_year = []
    let mid_index = this.data.findIndex(d => d.date.getTime() ===  new Date(this.raceday[index]).getTime());
    let start_index = mid_index - 183;
    let end_index = mid_index + 182;
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
    this.selectedYears.forEach((year, index) => {
      this.createHorizonChart(this.newYears[year], this.selected, index);
    });
    this.addTooltip();
  }
}
