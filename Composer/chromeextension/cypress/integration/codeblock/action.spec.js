/// <reference types="Cypress" />

describe('action', () => {
  it('property', () => {
    cy.visit(
        'https://github.com/xieofxie/BotFramework-Composer/issues/27'
      );
    cy.get('div#rendercodeblock_0_0_button', { timeout: 10000 }).click();
    // TODO focus work around?
    cy.get(`i[data-icon-name="LightningBolt"]`).eq(0).click();
    cy.checkProperty('SendActivity', 'Send a response');
    cy.checkProperty('IfCondition', 'Branch: If/Else');
  });
});
