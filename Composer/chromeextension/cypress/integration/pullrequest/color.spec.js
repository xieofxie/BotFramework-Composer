/// <reference types="Cypress" />

import { Status } from '../../support/commands';

describe('color', () => {
  beforeEach(() => {
    cy.visit(
      'https://github.com/xieofxie/BotFramework-Composer/pull/19/files'
    );
    cy.get('div#renderdiff_0_button_all', { timeout: 10000 }).click();
    // TODO work around for a correct get list
    cy.get(`div[aria-label="TraceActivity"]`).eq(2, { timeout: 10000 });
  });

  it('addition', () => {
    cy.checkColor('TraceActivity', 2, Status.Addition);
    cy.get('select').eq(1).select('triggers[4]');
    cy.checkColor('SetProperties', 0, Status.Addition);
  });

  it('deletion', () => {
    cy.checkColor('SendActivity', 0, Status.Deletion);
    cy.get('select').eq(0).select('triggers[4]');
    cy.checkColor('SetProperties', 0, Status.Deletion);
  });

  it('both', () => {
    cy.get('summary.btn-link').eq(2).click();
    cy.get('label.flex-auto.btn.btn-sm.BtnGroup-item.text-center').eq(1).click();
    cy.get('button.btn.btn-primary.btn-sm.col-12.mt-3').eq(0).click();

    cy.get('div#renderdiff_0_button_all', { timeout: 10000 }).click();
    // TODO work around for a correct get list
    cy.get(`div[aria-label="TraceActivity"]`).eq(2, { timeout: 10000 });

    cy.get('div#renderdiff_0_0_button', { timeout: 10000 }).click();
    cy.get('select').eq(0, { timeout: 10000 }).select('triggers[4]');
    cy.checkColor('SetProperties', 0, Status.Both);

    cy.get('div#renderdiff_0_1_button', { timeout: 10000 }).click();
    cy.get('select').eq(1, { timeout: 10000 }).select('triggers[4]');
    cy.checkColor('SetProperties', 1, Status.Both);
  });
});
