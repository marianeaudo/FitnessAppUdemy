import { Injectable } from '@angular/core';
import { Exercise } from './exercise.model'
import { Subject, Subscription } from 'rxjs';
import { AngularFirestore } from 'angularfire2/firestore';
import { map } from 'rxjs/operators'
import { UIService } from '../shared/ui.service';

@Injectable({
  providedIn: 'root'
})
export class TrainingService {

  private availableExercises: Exercise[] = [];

  exerciceChanged = new Subject<Exercise>();
  exercisesChanged = new Subject<Exercise[]>();
  pastExercisesChanged = new Subject<Exercise[]>();
  private fbSubscription: Subscription[] =[];

  private runningExercise: Exercise;

  constructor(private db: AngularFirestore, private uiService: UIService) {

  }

  fetchAvailableExercises() {
    this.uiService.loadingStateChanged.next(true);
    this.fbSubscription.push(this.db.collection('availableExercises').snapshotChanges()
    .pipe(map((docArray) => {
      // throw (new Error());
      return docArray.map((doc) => {
        return {
          id: doc.payload.doc.id,
          ...doc.payload.doc.data() as Exercise
        }
      });
     }
    )).subscribe((exercises: Exercise[]) => {
      this.availableExercises = exercises;
      this.exercisesChanged.next([...this.availableExercises]);
      this.uiService.loadingStateChanged.next(false);
    }, (error) => {
        this.uiService.loadingStateChanged.next(false);
        this.uiService.showSnackbar('Fetching exercises failed, please try again later', null, 3000);
        this.exercisesChanged.next(null);
    })
    );
  }

  startExercise(selectedId: string) {
    // this.db.doc('availableExercises/' + selectedId).update({lastSelected: new Date()});
    this.runningExercise = this.availableExercises.find(ex => ex.id === selectedId);
    this.exerciceChanged.next({ ...this.runningExercise });
  }

  completeExercise() {
    this.addDataToDatabase({ ...this.runningExercise, date: new Date(), state: "completed" });
    this.runningExercise = null;
    this.exerciceChanged.next(null);
  }

  cancelExercise(progress: number) {
    this.addDataToDatabase({
      ...this.runningExercise,
      duration: this.runningExercise.duration * progress / 100,
      calories: this.runningExercise.calories * progress / 100,
      date: new Date(),
      state: "cancelled"
    });
    this.runningExercise = null;
    this.exerciceChanged.next(null);
  }

  getRunningExercise() {
    return { ...this.runningExercise };
  }

  fetchPastExercises() {
    this.fbSubscription.push(this.db.collection('pastExercises').valueChanges().subscribe((exercises: Exercise[]) => {
      this.pastExercisesChanged.next(exercises);
    }));
  }

  cancelSubscription() {
    this.fbSubscription.forEach(sub => sub.unsubscribe());
  }

  private addDataToDatabase(exercise: Exercise) {
    this.db.collection('pastExercises').add(exercise);
  }

}
