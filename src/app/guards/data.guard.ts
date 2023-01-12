import { Injectable } from '@angular/core';
import { CanActivate, Router} from '@angular/router';
import {DataService} from "../services/data.service";

@Injectable({
  providedIn: 'root'
})
export class DataGuard implements CanActivate {

  constructor(private dataService: DataService, private router: Router) {}

  canActivate(): boolean {
    if (this.dataService.checkData()) {
      return true;
    } else {
      this.router.navigate(['/']);
      return false;
    }
  }

}
