/// <reference types="Cypress" />

describe('property', () => {
  it('select another trigger', () => {
    cy.visit(
      'https://github.com/xieofxie/BotFramework-Composer/blob/hualxie/extension/Composer/chromeextension/test/calendarskill.dialog'
    );
    cy.get('div#renderraw_0_button', { timeout: 10000 }).click();
    cy.checkProperty('TraceActivity', 'Emit a trace event');
    // another
    cy.get('select').select('triggers[1]');
    cy.checkProperty('CancelAllDialogs', 'Cancel all active dialogs');
  });
});
