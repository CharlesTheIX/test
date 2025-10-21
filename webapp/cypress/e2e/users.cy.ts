import { faker } from "@faker-js/faker";

describe("Users Page tests", () => {
  beforeEach(() => {});

  // it("SUCCESS: Make the API call to get all users and display the data ina table", () => {
  //   cy.intercept("POST", "/api/users").as("getUsers");
  //   cy.visit("/users");
  //   cy.wait("@getUsers").then((interception) => {
  //     const res = interception.response;
  //     expect(res?.statusCode).to.eq(200);

  //     const body = res?.body;
  //     expect(body.error).to.eq(false);
  //     expect(body.status).to.eq(200);
  //     expect(body.data).to.exist;
  //   });
  // });

  // it("SUCCESS: Create a new user WITHOUT a company", () => {
  //   const data = {
  //     permissions: [0, 1, 2],
  //     surname: faker.person.lastName(),
  //     first_name: faker.person.firstName(),
  //     username: `test_${faker.internet.username()}_test`,
  //   };

  //   cy.intercept("PUT", "/api/users/create").as("createUser");
  //   cy.visit("/users/create");

  //   cy.get(`[data-cy="username"]`).find("input").type(data.username);
  //   cy.get(`[data-cy="first_name"]`).find("input").type(data.first_name);
  //   cy.get(`[data-cy="surname"]`).find("input").type(data.surname);
  //   cy.get(`[data-cy="permissions"]`).find(".select-value").click();
  //   cy.get(`[data-cy="permissions"] li`).each(($el, i) => {
  //     if (data.permissions.includes(i)) cy.wrap($el).click();
  //   });
  //   cy.get(`[data-cy="permissions"] .options-background`).click();
  //   cy.get(`[data-cy="submission-button"]`).click();

  //   cy.wait("@createUser").then((interception) => {
  //     const res = interception.response;
  //     expect(res?.statusCode).to.eq(200);
  //   });
  // });

  // it("SUCCESS: Create a new user WITH a company", () => {
  //   const data = {
  //     company_name: "Tester",
  //     permissions: [0, 1, 2],
  //     surname: faker.person.lastName(),
  //     first_name: faker.person.firstName(),
  //     username: `test_${faker.internet.username()}_test`,
  //   };

  //   cy.intercept("PUT", "/api/users/create").as("createUser");
  //   cy.visit("/users/create");

  //   cy.get(`[data-cy="username"]`).find("input").type(data.username);
  //   cy.get(`[data-cy="first_name"]`).find("input").type(data.first_name);
  //   cy.get(`[data-cy="surname"]`).find("input").type(data.surname);
  //   cy.get(`[data-cy="company_id"]`).find(".select-value").click();
  //   cy.get(`[data-cy="company_id"] li`).contains(data.company_name).click();

  //   cy.get(`[data-cy="permissions"]`).find(".select-value").click();
  //   cy.get(`[data-cy="permissions"] li`).each(($el, i) => {
  //     if (data.permissions.includes(i)) cy.wrap($el).click();
  //   });
  //   cy.get(`[data-cy="permissions"] .options-background`).click();
  //   cy.get(`[data-cy="submission-button"]`).click();

  //   cy.wait("@createUser").then((interception) => {
  //     const res = interception.response;
  //     expect(res?.statusCode).to.eq(200);
  //   });
  // });

  it("SUCCESS: Should navigate to the individual user page", () => {
    var table_length = 0;
    cy.intercept("POST", "/api/users").as("getUsers");
    cy.visit("/users");
    cy.wait("@getUsers").then((interception) => {
      const res = interception.response;
      expect(res?.statusCode).to.eq(200);

      const body = res?.body;
      expect(body.error).to.eq(false);
      expect(body.status).to.eq(200);
      expect(body.data).to.exist;
      table_length = body.data.length;
    });

    cy.get(`table tbody tr`).each(($el, i) => {
      if (i === table_length - 1) cy.wrap($el).click();
    });
    cy.url().should("contain", "/users/");
  });

  it("SUCCESS: Should navigate to the individual user page and edit", () => {
    var table_length = 0;
    cy.intercept("POST", "/api/users").as("getUsers");
    cy.visit("/users");
    cy.wait("@getUsers").then((interception) => {
      const res = interception.response;
      expect(res?.statusCode).to.eq(200);

      const body = res?.body;
      expect(body.error).to.eq(false);
      expect(body.status).to.eq(200);
      expect(body.data).to.exist;
      table_length = body.data.length;
    });

    cy.get(`table tbody tr`).each(($el, i) => {
      if (i === table_length - 1) cy.wrap($el).click();
    });
    cy.url().should("contain", "/users/");
  });
});
