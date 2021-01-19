/// <reference types="Cypress" />

describe('actionarray', () => {
  it('property', () => {
    cy.visit('https://github.com/xieofxie/BotFramework-Composer/issues/28');
    cy.get('div#rendercodeblock_0_0_button', { timeout: 10000 }).click();
    cy.get(`i[data-icon-name="LightningBolt"]`).eq(0).click();
    cy.checkProperty('Send a response', 'Send a response');
    cy.checkProperty('BeginDialog', 'Begin a new dialog');
  });
});
