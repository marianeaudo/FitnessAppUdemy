import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, CanLoad } from '@angular/router';
import { Observable } from 'rxjs';
import { Injectable } from '@angular/core';
import { Route } from '@angular/router';
import { Store } from '@ngrx/store';
import { take } from 'rxjs/operators'


import { AuthService } from './auth.service';
import * as fromRoot from '../app.reducer';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanLoad {

  constructor(private authService: AuthService, private store: Store<fromRoot.State>) {

  }

  canActivate(router: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> | Observable<boolean> | boolean {
    return this.store.select(fromRoot.getIsAuthenticated).pipe(take(1));
  }

  canLoad(router: Route) {
    return this.store.select(fromRoot.getIsAuthenticated).pipe(take(1));
  }
}
