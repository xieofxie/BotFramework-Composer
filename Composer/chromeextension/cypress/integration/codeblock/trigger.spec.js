/// <reference types="Cypress" />

describe('trigger', () => {
  it('property', () => {
    cy.visit(
        'https://github.com/xieofxie/BotFramework-Composer/issues/26'
      );
    cy.get('div#rendercodeblock_0_0_button', { timeout: 10000 }).click();
    cy.checkProperty('IfCondition', 'Branch: If/Else');
    cy.checkProperty('TraceActivity', 'Emit a trace event');
  });
});
