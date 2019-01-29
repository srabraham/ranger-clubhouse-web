import Route from '@ember/routing/route';
import MeRouteMixin from 'clubhouse/mixins/route/me';

export default class MeOverviewRoute extends Route.extend(MeRouteMixin) {
  setupController(controller) {
    super.setupController(...arguments);

    const person = this.modelFor('me');

    controller.set('photo', null);

    if (!person.isPastProspective && !person.isAuditor) {
      this.ajax.request(`person/${this.session.user.id}/photo`)
        .then((result) => controller.set('photo', result.photo))
        .catch(() => {
          controller.set('photo', { status: 'error', message: 'There was a server error.' });
        })
    }
  }
}
