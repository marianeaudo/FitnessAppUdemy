import { Component, OnInit, OnDestroy } from '@angular/core';
import { TrainingService } from '../training.service';
import { Exercise } from '../exercise.model';
import { NgForm } from '@angular/forms';
import { AngularFirestore } from 'angularfire2/firestore'
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/operators';



@Component({
  selector: 'app-new-training',
  templateUrl: './new-training.component.html',
  styleUrls: ['./new-training.component.css']
})
export class NewTrainingComponent implements OnInit, OnDestroy {

  availableExercisesSubscription: Subscription;
  exercises: Exercise[] = [];


  constructor(private trainingService: TrainingService, private db: AngularFirestore) { }

  ngOnInit(): void {
    this.availableExercisesSubscription = this.trainingService.exercisesChanged.subscribe((availableExercises: Exercise[]) => {
      this.exercises = availableExercises;
    });
    this.trainingService.fetchAvailableExercises();
  }

  onStartTraining(form: NgForm) {
    this.trainingService.startExercise(form.value.exercise);
  }

  ngOnDestroy() {
    this.availableExercisesSubscription.unsubscribe();
  }

}
