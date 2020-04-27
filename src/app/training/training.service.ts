import { Injectable } from '@angular/core';
import { Subscription } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';
import { map, take } from 'rxjs/operators';
import { Store } from '@ngrx/store';

import { UIService } from '../shared/ui.service';
import { Exercise } from './exercise.model';
import * as UI from '../shared/ui.actions';
import * as fromTraining from './training.reducer';
import * as Training from './training.actions';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  private fbSubscription: Subscription[] =[];

  constructor(private db: AngularFirestore, private uiService: UIService, private store: Store<fromTraining.State>) {

  }

  fetchAvailableExercises() {
    this.store.dispatch(new UI.StartLoading());
    this.fbSubscription.push(this.db.collection('availableExercises').snapshotChanges()
    .pipe(map((docArray) => {
      return docArray.map((doc) => {
        return {
          id: doc.payload.doc.id,
          ...doc.payload.doc.data() as Exercise
        }
      });
     }
    )).subscribe((exercises: Exercise[]) => {
      this.store.dispatch(new Training.SetAvailableTrainings(exercises));
      this.store.dispatch(new UI.StopLoading());
        }, (error) => {
          this.store.dispatch(new UI.StopLoading());
        this.uiService.showSnackbar('Fetching exercises failed, please try again later', null, 3000);
    })
    );
  }

  startExercise(selectedId: string) {
    this.store.dispatch(new Training.StartTraining(selectedId));

  }

  completeExercise() {
    this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe((exercise: Exercise) => {
      this.addDataToDatabase({ ...exercise, date: new Date(), state: "completed" });
    });
    this.store.dispatch(new Training.StopTraining());
  }

  cancelExercise(progress: number) {
    this.store.select(fromTraining.getActiveTraining).pipe(take(1)).subscribe((exercise: Exercise) => {
      this.addDataToDatabase({
        ...exercise,
        duration: exercise.duration * progress / 100,
        calories: exercise.calories * progress / 100,
        date: new Date(),
        state: "cancelled"
      });
    });
    this.store.dispatch(new Training.StopTraining());
  }

  fetchPastExercises() {
    this.fbSubscription.push(this.db.collection('pastExercises').valueChanges().subscribe((exercises: Exercise[]) => {
      this.store.dispatch(new Training.SetFinishedTrainings(exercises));
    }));
  }

  cancelSubscription() {
    this.fbSubscription.forEach(sub => sub.unsubscribe());
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('pastExercises').add(exercise);
  }

}
