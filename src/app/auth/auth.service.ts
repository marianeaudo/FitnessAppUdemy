import { Injectable } from '@angular/core';
import { AuthData } from './auth-data.model';
import { Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AngularFireAuth } from 'angularfire2/auth'
import { TrainingService } from '../training/training.service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  authChange = new Subject<boolean>();
  private isAuthenticated = false;

  constructor(private router: Router, private auth: AngularFireAuth, private trainingService: TrainingService) {

  }

  initAuthListener() {
    this.auth.authState.subscribe((user) => {
      if (user) {
        this.authChange.next(true);
        this.router.navigate(['/training']);
        this.isAuthenticated = true;
      } else {
        this.authChange.next(false);
        this.router.navigate(['/login']);
        this.isAuthenticated = false;
        this.trainingService.cancelSubscription();      }
    });
  }

  registerUser(authData: AuthData) {
    this.auth.auth.createUserWithEmailAndPassword(authData.email, authData.password)
    .catch((error) => {
      console.log(error);
    })
    }

  login(authData: AuthData) {
    this.auth.auth.signInWithEmailAndPassword(authData.email, authData.password)
    .catch((error) => {
      console.log(error);
    })
  }

  logout() {
    this.auth.auth.signOut();

  }

  isAuth() {
    return this.isAuthenticated;
  }

}
