# How to contribute

## Filing an issue

If you want your issue to be resolved quickly, please include in your issue:

* Gatsby version, node.js version, OS version
* The contents of your `gatsby-config.js` and `package.json` as well as your
  `gatsby-node.js`, `gatsby-browser.js` `gatsby-ssr.js` files depending on
  changes you've made there.

## Contributing
You can install the latest `master` version of Gatsby by following these steps:

* Clone the repo, navigate to its directory.
* Install dependencies using `yarn install` in the root of the repo.

The usual contributing steps are:

* Fork the [official repository](https://github.com/gatsbyjs/gatsby).
* Clone your fork: git clone `git@github.com:<your-username>/gatsby.git`
* Install yarn, lerna, and gatsby-dev-cli globaly: `npm install -g yarn lerna gatsby-dev-cli@canary`
* Checkout to the 1.0 branch: `git checkout 1.0`
* Install dependencies: `yarn && lerna bootstrap`
* Make sure tests are passing for you: `yarn run test`
* Create a topic branch: `git checkout -b topics/new-feature-name`
* Run `yarn run watch` to do an initial build of all packages and watch for
  changes to packages' source code and compile changes on the fly as you
  work.
* Use the `gatsby-dev` command to copy files from your cloned copy of Gatsby
  to test Gatsby sites. To use, go to a site you want to work on and run
  `gatsby-dev`. This will copy over the built version of every gatsby
  package the site is using. Note: the first time you run the command,
  you'll also need to set the path to clone of the Gatsby repository.
* Add tests and code for your changes.
* Once you‘re done, make sure all tests still pass: `yarn test`
* Commit and push to your fork.
* Create an pull request from your branch.

Test suite can be run via `yarn test`.

This project uses [FlowType](https://flowtype.org/) for static type checking.
