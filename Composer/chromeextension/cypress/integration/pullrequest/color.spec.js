/// <reference types="Cypress" />

import { Status } from '../../support/commands';

describe('color', () => {
  it('addition', () => {
    cy.visit(
      'https://github.com/xieofxie/BotFramework-Composer/pull/19/files'
    );
    // TODO work around for a correct get list
    cy.get('div#renderdiff_0_button_all', { timeout: 10000 }).click().wait(5000);
    cy.checkColor('TraceActivity', 2, Status.Addition);
    cy.get('select').eq(1).select('triggers[4]');
    cy.checkColor('SetProperties', 0, Status.Addition);
  });

  it('deletion', () => {
    cy.checkColor('SendActivity', 0, Status.Deletion);
    cy.get('select').eq(0).select('triggers[4]');
    cy.checkColor('SetProperties', 0, Status.Deletion);
  });
});
