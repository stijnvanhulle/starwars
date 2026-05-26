# Whale Front-end Coding Test

We want to create a front-end application that fetches data from a Starwars API endpoint to show-case the characters in an overview page where every character has its own details page. Next to that, we want to manage a team based on the Starwars characters which will be selected in the character details page. We will work in different phases that are fully functional.

## Transform the current template to use following libraries:

* `Next.js` `16.2.6`
* `Material UI` v9 (`9.0.1`) as our component library
* `Typescript` `^6.0.3`
* `React` (`Next.js` 16.2.6 provides the version)
* `@reduxjs/toolkit` `^2.12.0` and `react-redux` `^9.3.0` for global stores
* `RTK Query` (bundled with `@reduxjs/toolkit`) for fetching data (from our Starwars API)
* `@playwright/test` `^1.60.0` for e2e testing
* `Vitest` `^4.1.6` for unit tests and integration tests
* `Kubb` `5.0.0-beta.23` for our generated types and clients
* `PostgreSQL` 17 as database, with `drizzle-orm` `^0.45.2` and `drizzle-kit` `^0.31.10` (driver: `pg` `^8.21.0`, types: `@types/pg` `^8.20.0`) as the layer between db and data (use `db` folder)
* Use the `Repository` concept to have a layer between `DB` and `services`
* Use the `Services` concept to have a layer between `Repositories` an `API`

Starwars API: https://akabab.github.io/starwars-api/

## Requirements (external copy paste)

```
We’re assembling a team to fight the dark side! Our application will assist us in creating a team of maximum 5 Star Wars characters. Our team is determined to eradicate evil, which means no evil members are allowed to join.

* Create a `Next.js` application that shows a list of Star Wars characters
* The application should have a detail page for every character
* Each detail page shows some basic information about the selected character (name, image, height, mass, affiliations)
* Each detail page has a next and previous button to navigate between characters
* Each detail page allows us to add and/or remove the selected character from our team
* The application should have a team page showing your assembled team. We should be able to remove characters from our team from this page as well.
* We should be able to see and manage our assembled team from every page
* A team has max. 5 members

A character is defined as evil when:

* They have ‘Darth’ or ‘Sith’ in their name
* They have at least one affiliation that mentions ‘Darth’ or ‘Sith’  (you may ignore former affiliations)
* They have at least one master with ‘Darth’ in their name
```
## Style

* Ask questions and do not assume you are correct, we will validate every phase before starting the implementation.
* Every phase will be part of the plans(`/plan/starwars-team-builder/001-setup.md`) folder with a well-defined name.
* Use the same plan structure between plans
* Every plan should be executed independently
* Update `README.MD` with tech stack, uses cases and folder structure
* Our Next.js app will be part of the `apps/platform` folder, use `packages/components` folder to store our components (based on `Material UI`)
* Use some concepts from Github speckit:
  * `plan.md`: the big picture. What we're building, what we use
  * `spec.md`: what the app should do, functional requirements and acceptance checklist
  * `research.md`: the choices we made and why. Also any open questions we still need to answer
  * `quickstart.md`: how to use the app and see how it works
