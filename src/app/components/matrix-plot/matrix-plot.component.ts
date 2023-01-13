import {Component, OnInit} from '@angular/core';
import {DataService} from "../../services/data.service";
@Component({
  selector: 'app-matrix-plot',
  templateUrl: './matrix-plot.component.html',
  styleUrls: ['./matrix-plot.component.scss']
})
export class MatrixPlotComponent implements OnInit {

  data: any[];
  year1: any;

  year2: any;

  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.data = this.dataService.createData(this.dataService.getData());
    this.year1 = this.data[0].key;
    this.year2 = this.data[0].key;
  }

  getYearData(year) {
    return this.data.filter(d => d.key === year)[0];
  }



}
