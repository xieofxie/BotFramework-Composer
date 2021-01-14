/// <reference types="cypress" />

declare namespace Cypress {
  interface Chainable {
    checkProperty(label: string, title: string): void;
  }
}
