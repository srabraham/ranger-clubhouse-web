import ClubhouseController from 'clubhouse/controllers/clubhouse-controller';
import {action} from '@ember/object';
import {tracked} from '@glimmer/tracking';

export default class MentorPotentialsController extends ClubhouseController {
  @tracked mentees;

  @tracked untrained;
  @tracked personnelFlagged;
  @tracked rrnFlagged;
  @tracked vcFlagged;
  @tracked trainingFlagged;
  @tracked mentorFlagged;

  get viewPotentials() {
    let mentees = this.mentees;

    if (this.untrained) {
      mentees = mentees.filter((p) => !p.trained);
    }

    if (this.personnelFlagged) {
      mentees = mentees.filter((p) => (p.personnel_ranks ? p.personnel_ranks.find((r) => r.rank >= 3) : false));
    }

    if (this.rrnFlagged) {
      mentees = mentees.filter((p) => (p.rrn_ranks ? p.rrn_ranks.find((r) => r.rank >= 3) : false));
    }

    if (this.vcFlagged) {
      mentees = mentees.filter((p) => (p.vc_ranks ? p.vc_ranks.find((r) => r.rank >= 3) : false));
    }

    if (this.mentorFlagged) {
      mentees = mentees.filter((p) => p.mentor_team.find((m) => m.rank >= 3));
    }

    if (this.trainingFlagged) {
      mentees = mentees.filter((p) => p.trainings.find((t) => t.training_rank >= 3));

    }

    return mentees;
  }

  @action
  noteSubmitted(person) {
    // Refresh the mentee
    this.ajax.request('mentor/mentees', {data: {year: this.year, person_id: person.id}}).then(({mentee}) => {
      this.mentees = this.mentees.map((m) => m.id == person.id ? mentee : m);
    }).catch((response) => this.house.handleErrorResponse(response));
  }
}
