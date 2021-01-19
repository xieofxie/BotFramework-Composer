/// <reference types="Cypress" />

import { Status } from '../../support/commands';

describe('toggle', () => {
  it('toggle', () => {
    cy.visit(
      'https://github.com/xieofxie/BotFramework-Composer/pull/19/files'
    );
    cy.get('div#renderdiff_0_0_button', { timeout: 10000 }).click();
    cy.get('div#renderdiff_0_0_div').should('have.css', 'display', 'block');
    cy.get('div#renderdiff_0_1_div').should('have.css', 'display', 'none');

    cy.get('div#renderdiff_0_1_button', { timeout: 10000 }).click();
    cy.get('div#renderdiff_0_0_div').should('have.css', 'display', 'none');
    cy.get('div#renderdiff_0_1_div').should('have.css', 'display', 'block');

    cy.get('div#renderdiff_0_button_all', { timeout: 10000 }).click();
    cy.get('div#renderdiff_0_0_div').should('have.css', 'display', 'block');
    cy.get('div#renderdiff_0_1_div').should('have.css', 'display', 'block');

    cy.get('div#renderdiff_0_button_all', { timeout: 10000 }).click();
    cy.get('div#renderdiff_0_0_div').should('have.css', 'display', 'none');
    cy.get('div#renderdiff_0_1_div').should('have.css', 'display', 'none');
  });
});
