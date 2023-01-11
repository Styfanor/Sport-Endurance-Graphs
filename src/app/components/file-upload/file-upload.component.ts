import { Component, OnInit } from '@angular/core';
import {Globals} from "../../globals";
import * as moment from 'moment';

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
    const propertyNames = csvText.slice(0, csvText.indexOf('\n')).replace(/\s/g,'').split(',');
    const dataRows = csvText.slice(csvText.indexOf('\n') + 1).split('\n');

    let dataArray: any[] = [];
    dataRows.forEach((row) => {
      let values = row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g);
      let obj: any = {};

      for (let index = 0; index < propertyNames.length; index++) {
        const propertyName: string = propertyNames[index];
        if (values !== null){
          let val: any = values[index];
          if (val === undefined || val === null || val === '') {
            val = null;
          } else {
            val = val.replace(/['"]+/g, '');
          }
          obj[propertyName] = val;
        }
      }

      dataArray.push(obj);
    });

    dataArray.pop();

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
