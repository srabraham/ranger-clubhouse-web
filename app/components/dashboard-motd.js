import Component from '@glimmer/component';
import {action, set} from '@ember/object';
import fade from 'ember-animated/transitions/fade';
import {inject as service} from '@ember/service';
import $ from 'jquery';

export default class DashboardMotdComponent extends Component {
  @service ajax;
  @service toast;
  @service house;

  fadeMotdEffect = fade;

  constructor() {
    super(...arguments);
    const { hasBottomArrow } = this.args;

    this.hasBottomArrow = (hasBottomArrow === undefined ? true : hasBottomArrow);
  }

  @action
  toggleMotd(motd) {
    this.args.motds.forEach((m) => {
      set(m, 'showing', (motd.id === m.id) ? !motd.showing : false);
      $(`#motd-text-${motd.id}`).collapse(m.showing ? 'show' : 'hide');
    });
  }

  get unreadMotds() {
    return this.args.motds.filter((m) => !m.has_read);
  }

  @action
  markMotdAsRead(motd) {
    set(motd, 'isMarking', true);
    this.ajax.request(`motd/${motd.id}/markread`, {method: 'POST'})
      .then(() => {
        set(motd, 'showing', false);
        set(motd, 'has_read', true);
        $(`#motd-text-${motd.id}`).collapse('hide');
        this.toast.success('Announcement marked as read.');
      }).catch((response) => this.house.handleErrorResponse(response))
      .finally(() => set(motd, 'isMarking', false));
  }
}

