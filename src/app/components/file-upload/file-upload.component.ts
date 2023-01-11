import { Component, OnInit } from '@angular/core';
import {Globals} from "../../globals";
import * as moment from 'moment';
import * as papaparse from 'papaparse';

@Component({
  selector: 'app-file-upload',
  templateUrl: './file-upload.component.html',
  styleUrls: ['./file-upload.component.scss']
})
export class FileUploadComponent implements OnInit {

  data: any[] = Globals.data;

  displayedColumns: string[] = ['id', 'date', 'name'];
  constructor() { }

  ngOnInit(): void {
  }

  async importDataFromCSV(event: any) {
    const file: File = event.target.files[0];
    let csvText: String = await file.text();
    const propertyNames = csvText.slice(0, csvText.indexOf('\n')).replace(/\s/g,'');
    const dataRows = csvText.slice(csvText.indexOf('\n') + 1);
    csvText = propertyNames + '\n' + dataRows;
    // @ts-ignore
    let dataArray: any[] = papaparse.parse(csvText,{header: true}).data;
    console.log(dataArray);
    dataArray.forEach(d => {
      if (moment(d.ActivityDate, "DD.MM.YYYY").isValid()) {
        d.ActivityDate = moment(d.ActivityDate, "DD.MM.YYYY").toDate();
      } else {
        d.ActivityDate = moment(d.ActivityDate).toDate();
      }
    });

    this.data = dataArray;
    Globals.data = this.data;
    console.log(this.data);
  }

}
