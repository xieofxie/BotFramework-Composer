// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add("login", (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add("drag", { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add("dismiss", { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite("visit", (originalFn, url, options) => { ... })

export enum Status {
  Addition = 'addition',
  Deletion = 'deletion',
  Both = 'both',
}

Cypress.Commands.add('checkProperty', (label: string, title: string) => {
  cy.get(`div[aria-label="${label}"]`).click();
  cy.get(`input[aria-label="form title"][value="${title}"]`);
});

Cypress.Commands.add('checkColor', (label: string, index: number, status: Status) => {
  // cy.get(`div[aria-label="${label}"]`).then((val) => {
  //   console.log(val);
  // });
  // TODO handle CardNode
  let headerCy = cy.get(`div[aria-label="${label}"]`).eq(index).children().children();
  headerCy.then((header) => {
    if(header[0].className.indexOf('ActionHeader') < 0){
      headerCy = headerCy.children().children();
    }
  })

  headerCy.should('have.css', 'background-color').then((colorE) => {
    // @ts-ignore
    const color: string = colorE;
    if (status == Status.Addition) {
      assert.equal(color, 'rgb(230, 255, 237)');
    } else if (status == Status.Deletion) {
      assert.equal(color, 'rgb(255, 238, 240)');
    } else if (status == Status.Both){
      assert.equal(color, 'rgb(255, 255, 0)');
    } else {
      throw `Unhandled status ${status}!`;
    }
  });
});
