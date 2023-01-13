import { Injectable } from '@angular/core';
import * as d3 from 'd3';
import * as d3col from "d3-collection";

@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor() { }

  public getData(): any[] {
    if(localStorage.getItem('data')) {
      let data: any[] = JSON.parse(localStorage.getItem('data'));
      data.forEach(d => {
        d.ActivityDate = new Date(d.ActivityDate);
      });
      return data;
    } else {
      return null;
    }
  }

  public setData(data: any[]) {
    localStorage.setItem('data', JSON.stringify(data));
  }


  public createData(data: any[]): any[] {
    console.log(data);
    data.sort((a,b)=>a.ActivityDate.getTime()-b.ActivityDate.getTime());
    let temp: any[] = [];
    let dateval: any[] = [];
    data.forEach(d => {
      if(temp.some(e => e.date.getTime() === d.ActivityDate.getTime())) {
        let idx = temp.findIndex(e => e.date.getTime() === d.ActivityDate.getTime());
        if(!(Number(d.RelativeEffort) > 1000)){
          temp[idx].value = temp[idx].value + Number(d.RelativeEffort);
        }
      } else{
        if(!(Number(d.RelativeEffort) > 1000)) {
          temp.push({date: d.ActivityDate, value: Number(d.RelativeEffort)});
        } else {
          temp.push({date: d.ActivityDate, value: 0});
        }
      }
    });

    this.addMissingDays(temp);

    temp.forEach(d => {
      if(dateval.some(e => e.date.getTime() === d.date.getTime())) {
        let idx = dateval.findIndex(e => e.date.getTime() === d.date.getTime());
        dateval[idx].value = dateval[idx].value + Number(d.value);
      } else{
        dateval.push({date: d.date, value: Number(d.value)});
      }
    });

    this.addWeek(dateval);

    let years = d3col.nest().key(function (d: any) {
      return d.date.getFullYear()
    }).entries(dateval);
    console.log(years);
    return years;
  }

  public groupDataByWeek(data: any[]): any[] {
    let temp: any[] = [];
    data.forEach(d => {
      if(temp.some(e => e.week === d.week)) {
        let idx = temp.findIndex(e => e.week === d.week);
        temp[idx].value = temp[idx].value + Number(d.value);
      } else{
        temp.push({week: d.week, value: Number(d.value)});
      }
    });
    return temp;
  }

  public checkData(): boolean {
    if(!this.getData()) {
      return false;
    } else {
      return true;
    }
  }

  private addWeek(data: any[]) {
    data.forEach(d => {
      d.week = d3.timeMonday.count(d3.timeYear(d.date), d.date);
    });
  }

  private addMissingDays(dateValues: any[]) {
    for (let i = 0; i < dateValues.length - 1; i++) {
      let currentDate = new Date(dateValues[i].date);
      let nextDate = new Date(dateValues[i + 1].date);
      // @ts-ignore
      let difference = (nextDate - currentDate) / (1000 * 60 * 60 * 24);

      for (let j = 1; j < difference; j++) {
        let missingDate = new Date(currentDate);
        missingDate.setDate(currentDate.getDate() + j);
        let obj = {
          date: missingDate,
          value: 0
        };
        dateValues.splice(i + j, 0, obj);
      }
    }

    let firstDate = new Date(dateValues[0].date);
    if(firstDate.getMonth() !== 0 && firstDate.getDate() !== 1) {
      //add missing dates from start of the year
      // @ts-ignore
      let difference = (firstDate - new Date(firstDate.getFullYear(), 0, 1)) / (1000 * 60 * 60 * 24);
      for(let i = 0; i < difference; i++) {
        let missingDate = new Date(firstDate.getFullYear(), 0, 1);
        missingDate.setDate(missingDate.getDate() + i);
        let obj = {
          date: missingDate,
          value: 0
        };
        dateValues.splice(i, 0, obj);
      }
    }

    let lastDate = new Date(dateValues[dateValues.length - 1].date);
    if (lastDate.getMonth() !== 11 && lastDate.getDate() !== 31) {
      // add missing dates up until December 31st
      // @ts-ignore
      let difference = (new Date(lastDate.getFullYear(), 11,31) - lastDate) / (1000 * 60 * 60 * 24);

      for (let j = 1; j < difference; j++) {
        let missingDate = new Date(lastDate);
        missingDate.setDate(lastDate.getDate() + j);
        let obj = {
          date: missingDate,
          value: 0
        };
        dateValues.push(obj);
      }
    }
  }

}
