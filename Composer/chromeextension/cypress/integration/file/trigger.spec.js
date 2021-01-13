/// <reference types="Cypress" />

describe('My First Test', () => {
  it('Visits the Kitchen Sink', () => {
    cy.visit('https://github.com/xieofxie/BotFramework-Composer/blob/hualxie/extension/Composer/chromeextension/test/calendarskill.dialog');
    cy.get('div#renderraw_0_button', { timeout: 10000 }).click();
    cy.get('div.trigger__content-label').contains('ConversationUpdate activity');
    cy.get('select').select('triggers[1]');
    cy.get('div.trigger__content-label').contains('Intent recognized');
  });
});
