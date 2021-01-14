/// <reference types="cypress" />

declare enum Status{
  Addition = 'addition',
  Deletion = 'deletion',
  Both = 'both',
}

declare namespace Cypress {
  interface Chainable {
    checkProperty(label: string, title: string): void;

    checkColor(label: string, index: number, status: Status): void;
  }
}
