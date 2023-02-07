import {Component, OnInit} from '@angular/core';
import * as d3 from 'd3';
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-horizon-plot',
  templateUrl: './horizon-plot.component.html',
  styleUrls: ['./horizon-plot.component.scss']
})
export class HorizonPlotComponent implements OnInit {

  data: any[];
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

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.data = this.dataService.createData(this.dataService.getData(), 'RelativeEffort');
    this.yearsList = this.data.map(year => year.key);
    this.createSvg();
    this.selectedYears.forEach((year, index) => {
      this.createHorizonChart(this.data[year], this.selected, index);
    });
    this.addTooltip();
  }
  changeYears(){
    this.createSvg();
    this.selectedYears.forEach((year, index) => {
      this.createHorizonChart(this.data[year], this.selected, index);
    });
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
      .attr("width", this.width)
      .attr("height", (this.height*this.data.length))
      .attr("viewBox", [0, 0, this.width, (this.height*this.data.length)])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

    this.svg.selectAll("*").remove();
  }

  createHorizonChart(year, label, index) {
    this.svg = d3.select("#horizon");
    let min = this.findMin(this.data, label);
    let max = this.findMax(this.data, label);

      this.svg = this.svg.append("g")
        .attr("transform", `translate(50,${(index*this.height)})`);

      let data = this.dataService.getDataFFM(year.values);

      const xScale = d3.scaleUtc([data[0].date, data[data.length - 1].date], [0, this.width]);
      const yScale = d3.scaleLinear([min, max], [this.height, 0]);

      this.svg.append("g")
        .call(d3.axisBottom(xScale))
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

      /*d3.select("#horizon")
        .on("mouseover", function() { d3.selectAll("#focus").style("display", null);})
        .on("mouseout", function() { d3.selectAll("#focus").style("display", "none");})
        .on("mousemove", function(event) {
          // @ts-ignore
          var x0 = xScale.invert(d3.pointer(event)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            // @ts-ignore
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

          focus.select("text.y1")
            .attr("transform",
              "translate(" + xScale(d.date) + "," +
              yScale(d[label]) + ")")
            .text("Value: " + Math.round(d[label]));

          focus.select("text.y2")
            .attr("transform",
              "translate(" + xScale(d.date) + "," +
              yScale(d[label]) + ")")
            .text("Value: " + Math.round(d[label]));

          focus.select("text.y3")
            .attr("transform",
              "translate(" + xScale(d.date) + "," +
              yScale(d[label]) + ")")
            .text(d.date.getFullYear() +"-"+ (d.date.getMonth()+1) +"-"+ d.date.getDate());

          focus.select("text.y4")
            .attr("transform",
              "translate(" + xScale(d.date) + "," +
              yScale(d[label]) + ")")
            .text(d.date.getFullYear() +"-"+ (d.date.getMonth()+1) +"-"+ d.date.getDate());

          focus.select(".x")
            .attr("transform",
              "translate(" + xScale(d.date) + "," +
              yScale(d[label]) + ")")
            .attr("y2", 100 - yScale(d[label]));

          focus.select(".y")
            .attr("transform",
              "translate(" + 1000 * -1 + "," +
              yScale(d[label]) + ")")
            .attr("x2", 1000 + 1000);
        });*/

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
    this.selectedYears.forEach((year, index) => {
      this.createHorizonChart(this.data[year], this.selected, index);
    });
    this.addTooltip();
  }
}
