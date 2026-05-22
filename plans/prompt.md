# Whale Front-end Coding Test

We want to create a front-end application that fetches data from a Starwars API endpoint to show-case the characters in an overview page where every character has its own details page. Next to that, we want to manage a team based on the Starwars characters which will be selected in the character details page. We will work in different phases that are fully functional.

## Transform the current template to use following libraries:

* `Next.js` (latest version)
* `Material UI` as our component library (latest version)
* `Typescript`
* `React` (latest version, `Next.js` will already provide the version
* `Redux`, `Redux Toolkit` for global stores
* `RTK Query` for fetching data (from our Starwars API)
* `Playwright` for e2e testing
* `Vitest` for unit tests and integration tests
* `Kubb` (v 5.0.0-beta.23) for our generated types and clients
* Use of `PostgreSQL` as database with `Drizzle ORM` as layer between db and data (use `db` folder)
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
* Every phase will be part of the plans(`/plans/001-setup.md`) folder with a well-defined name.
* Use the same plan structure between plans
* Every plan should be executed independently
* Update `README.MD` with tech stack, uses cases and folder structure
* Our Next.js app will be part of the `apps/platform` folder, use `packages/components` folder to store our components (based on `Material UI`)
