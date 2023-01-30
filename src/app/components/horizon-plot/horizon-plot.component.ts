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

    let svg = d3.select("#horizon")
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
      svg = d3.select("#horizon");
      svg = svg.append("g")
        .attr("transform", `translate(50,${(i*height)})`);

      let data = this.dataService.getDataFFM(year.values);

      const xScale = d3.scaleUtc([data[0].date, data[data.length - 1].date], [0, width]);
      const yScale = d3.scaleLinear([min, max], [height, 0]);

      svg.append("g")
        .call(d3.axisBottom(xScale))
        .selectAll("text")
        .style("text-anchor", "end");

      svg.append("g")
        .call(d3.axisLeft(yScale));

      let lineSvg = svg.append("g");

      let focus = svg.append("g")
        .style("display", "none");

      let bisectDate = d3.bisector(function(d) { // @ts-ignore
        return d.date; }).left;

      focus.append("circle")
        .attr("class", "y")
        .style("fill", "none")
        .style("stroke", "blue")
        .attr("r", 4);

      // append the x line
      focus.append("line")
        .attr("class", "x")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("y1", 0)
        .attr("y2", height);

      // append the y line
      focus.append("line")
        .attr("class", "y")
        .style("stroke", "blue")
        .style("stroke-dasharray", "3,3")
        .style("opacity", 0.5)
        .attr("x1", width)
        .attr("x2", width);

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

      // append the rectangle to capture mouse
      svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .style("fill", "none")
        .style("pointer-events", "all")
        .on("mouseover", function() { focus.style("display", null); })
        .on("mouseout", function() { focus.style("display", "none"); })
        .on("mousemove", function(event) {
          // @ts-ignore
          var x0 = xScale.invert(d3.pointer(event)[0]),
            i = bisectDate(data, x0, 1),
            d0 = data[i - 1],
            d1 = data[i],
            // @ts-ignore
            d = x0 - d0.date > d1.date - x0 ? d1 : d0;

          focus.select("circle.y")
            .attr("transform",
              "translate(" + xScale(d.date) + "," +
              yScale(d[label]) + ")");

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
            .text(d.date.toISOString().split('T')[0]);

          focus.select("text.y4")
            .attr("transform",
              "translate(" + xScale(d.date) + "," +
              yScale(d[label]) + ")")
            .text(d.date.toISOString().split('T')[0]);

          focus.select(".x")
            .attr("transform",
              "translate(" + xScale(d.date) + "," +
              yScale(d[label]) + ")")
            .attr("y2", height - yScale(d[label]));

          focus.select(".y")
            .attr("transform",
              "translate(" + width * -1 + "," +
              yScale(d[label]) + ")")
            .attr("x2", width + width);
        });

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
    });
  }

  changeSelect() {
    this.createHorizonChart(this.data, this.selected);
  }
}
