import {Component, DoCheck, OnInit} from '@angular/core';
import {DataService} from "../../services/data.service";
import {ResizedEvent} from "angular-resize-event";

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
   matrixwidth: any;

  matrixheight: any;

  metrics: any[] = [
    {name: 'Relative Effort', value: 'RelativeEffort'},
    {name: 'Distance', value: 'Distance'},
    {name: 'Total Duration', value: 'ElapsedTime'},
    {name: 'Moving Duration', value: 'MovingTime'}
  ];
  selected: any = 'RelativeEffort';

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.data = this.dataService.createData(this.dataService.getData(), this.selected);
    this.year1 = this.data[0].key;
    this.year2 = this.data[0].key;
  }

  changeSelect():void {
    this.data = this.dataService.createData(this.dataService.getData(), this.selected);
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

  onResizedMatrix(event: ResizedEvent) {
    this.matrixwidth = event.newRect.width;
    this.matrixheight = event.newRect.height;
  }
}
