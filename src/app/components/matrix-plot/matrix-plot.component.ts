import {Component, OnInit} from '@angular/core';
import {DataService} from "../../services/data.service";
import {ResizedEvent} from "angular-resize-event";
import {coerceStringArray} from "@angular/cdk/coercion";
@Component({
  selector: 'app-matrix-plot',
  templateUrl: './matrix-plot.component.html',
  styleUrls: ['./matrix-plot.component.scss']
})
export class MatrixPlotComponent implements OnInit {

  data: any[];
  year1: any;

  year2: any;

  year2width: any;

  year2height: any;

  year1width: any;

  year1height: any;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.data = this.dataService.createData(this.dataService.getData());
    this.year1 = this.data[0].key;
    this.year2 = this.data[0].key;
  }

  getYearData(year) {
    return this.dataService.groupDataByWeek(this.data.filter(d => d.key === year)[0].values);
  }

  onResizedYear1(event: ResizedEvent) {
    this.year1width = event.newRect.width;
    this.year1height = event.newRect.height;
  }

  onResizedYear2(event: ResizedEvent) {
    this.year2width = event.newRect.width;
    this.year2height = event.newRect.height;
  }
}
