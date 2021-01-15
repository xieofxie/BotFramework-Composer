/// <reference types="Cypress" />

describe('full', () => {
  it('trigger: select another', () => {
    cy.visit(
      'https://github.com/xieofxie/BotFramework-Composer/issues/17'
    );
    cy.get('div#rendercodeblock_0_0_button', { timeout: 10000 }).click();
    cy.get('div.trigger__content-label').contains('ConversationUpdate activity');
    cy.get('select').select('triggers[1]');
    cy.get('div.trigger__content-label').contains('Intent recognized');
  });

  it('property: select another', () => {
    cy.checkProperty('CancelAllDialogs', 'Cancel all active dialogs');
    // another
    cy.get('select').select('triggers[0]');
    cy.checkProperty('TraceActivity', 'Emit a trace event');
  });
});
