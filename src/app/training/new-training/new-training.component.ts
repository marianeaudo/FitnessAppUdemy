import { Component, OnInit, OnDestroy } from '@angular/core';
import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore'
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { UIService } from 'src/app/shared/ui.service';



@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {

  private availableExercisesSubscription: Subscription;
  private loadingExercisesSubscription: Subscription;

  exercises: Exercise[] = [];
  isLoadingExercises: boolean = true;

  constructor(private trainingService: TrainingService, private db: AngularFirestore, private uiService: UIService) { }

  ngOnInit(): void {
    this.loadingExercisesSubscription = this.uiService.loadingStateChanged.subscribe((loadingState: boolean) => {
      this.isLoadingExercises = loadingState;
    });
    this.availableExercisesSubscription = this.trainingService.exercisesChanged.subscribe((availableExercises: Exercise[]) => {
      this.exercises = availableExercises;
    });
    this.onFetchExercises();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

  onFetchExercises() {
    this.trainingService.fetchAvailableExercises();
  }

  ngOnDestroy() {
    this.availableExercisesSubscription.unsubscribe();
    this.loadingExercisesSubscription.unsubscribe();
  }

}
