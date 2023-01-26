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

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.data = this.dataService.createData(this.dataService.getData(), 'RelativeEffort');
    this.createHorizonChart(this.data, this.selected);
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

  createHorizonChart(years, label) {

    const width = 1000;
    const height = 100;

    let svg = d3.select("#svg")
      .attr("width", width)
      .attr("height", (height*years.length))
      .attr("viewBox", [0, 0, width, (height*years.length)])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("font-family", "sans-serif")
      .attr("font-size", 10);

    svg.selectAll("*").remove();
    let min = this.findMin(years, label);
    let max = this.findMax(years, label);

    years.forEach((year, i) => {
      svg = d3.select("#svg");
      svg = svg.append("g")
        .attr("transform", `translate(50,${(i*height)})`);

      let data = this.dataService.getDataFFM(year.values);


      const xScale = d3.scaleUtc([data[0].date, data[data.length - 1].date], [0, width]);
      const yScale = d3.scaleLinear([min, max], [height, 0]);

      svg.append("g")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .attr("transform", "translate(-10,0)rotate(45)")
        .style("text-anchor", "end");

      svg.append("g")
        .call(d3.axisLeft(yScale));

      if (label === "form") {

        svg.append("path")
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
        svg.append("path")
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
        svg.append("path")
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
        svg.append("path")
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
        svg.append("path")
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
        svg.append("path")
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

        svg
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
        svg
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
        svg
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



    });
  }

  changeSelect() {
    this.createHorizonChart(this.data, this.selected);
  }
}
