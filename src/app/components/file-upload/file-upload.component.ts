import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import * as moment from 'moment';
import * as papaparse from 'papaparse';
import {DataService} from "../../services/data.service";

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  data: any[] = [];

  displayedColumns: string[] = ['id', 'date', 'name', "race"];

  dataSource;
  constructor(private dataService: DataService) { }

  ngOnInit(): void {
    this.data = this.dataService.getData();
    this.dataSource = new MatTableDataSource(this.data);
  }

  async importDataFromCSV(event: any) {
    const file: File = event.target.files[0];
    let csvText: String = await file.text();
    const propertyNames = csvText.slice(0, csvText.indexOf('\n')).replace(/\s/g,'');
    const dataRows = csvText.slice(csvText.indexOf('\n') + 1);
    csvText = propertyNames + '\n' + dataRows;
    // @ts-ignore
    let dataArray: any[] = papaparse.parse(csvText,{header: true}).data;
    dataArray.pop();
    dataArray.forEach(d => {
      d.israce = false;
      if (moment(d.ActivityDate, "DD.MM.YYYY").isValid()) {
        d.ActivityDate = moment(d.ActivityDate, "DD.MM.YYYY").toDate();
      } else {
        d.ActivityDate = moment(d.ActivityDate).toDate();
        d.ActivityDate.setHours(0,0,0,0);
      }
    });

    this.data = dataArray;
    this.dataSource = new MatTableDataSource(this.data);
    this.dataService.setData(this.data);
  }

  updateData(element) {
    this.data.find(d => d.ActivityID === element.ActivityID).israce = element.israce;
    this.dataService.setData(this.data);
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
}
