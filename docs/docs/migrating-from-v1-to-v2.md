---
title: Migrating from v1 to v2
---

> This document is a work in progress. Have you upgraded your site and run into something that's not covered here? [Add your changes on GitHub](https://github.com/gatsbyjs/gatsby/edit/master/docs/docs/migrating-from-v1-to-v2.md)!

## Introduction

This is a reference for upgrading your site from Gatsby v1 to Gatsby v2. While there's a lot covered here, you probably won't need to do everything for your site.

# Starting a new project with Gatsby v2

Before diving in to the upgrade guide, here's a brief section on starting a new project with Gatsby v2 instead of upgrading an existing project.

_Start from scratch:_ If you're a _start from scratch_ kind of person, you can install the Gatsby beta and React like this: `npm install gatsby@next react react-dom`

_Tutorial:_ If you'd like a step-by-step guide, [follow the tutorial](/tutorial/) to get started with Gatsby v2.

_Starters:_ If you'd rather use one of the official starters, you're in luck, there's a v2 edition for each of them. Install your favourite one with the Gatsby CLI.

`gatsby-starter-default` with v2:

```
gatsby new my-default-project https://github.com/gatsbyjs/gatsby-starter-default#v2
```

`gatsby-starter-hello-world` with v2:

```
gatsby new my-hello-world https://github.com/gatsbyjs/gatsby-starter-hello-world#v2
```

`gatsby-starter-blog` with v2:

```
gatsby new my-blog https://github.com/gatsbyjs/gatsby-starter-blog#v2
```

Read on for a detailed guide on what's new in version 2!

## What we'll cover

- [Update Gatsby version](#update-gatsby-version)
- [Manually install React](#manually-install-react)
- [Manually install plugins’ peer dependencies](#manually-install-plugins-peer-dependencies)
- [Update layout component](#update-layout-component)
- [Import Link from Gatsby](#import-link-from-gatsby)
- [Import graphql from Gatsby](#import-graphql-from-gatsby)
- [Rename `boundActionCreators` to `actions`](#rename-boundactioncreators-to-actions)
- [Rename `pathContext` to `pageContext`](#rename-pathcontext-to-pagecontext)
- [Rename responsive image queries](#rename-responsive-image-queries)
- [Manually specify PostCSS plugins](#manually-specify-postcss-plugins)
- [Convert to either pure CommonJS or pure ES6](#convert-to-either-pure-commonjs-or-pure-es6)
- [Don't query nodes by ID](#dont-query-nodes-by-id)
- [Remove explicit polyfills](#remove-explicit-polyfills)
- [Change `modifyBabelrc` to `onCreateBabelConfig`](#change-modifybabelrc-to-oncreatebabelconfig)
- [Change `modifyWebpackConfig` to `onCreateWebpackConfig`](#change-modifywebpackconfig-to-oncreatewebpackconfig)
- [Change `navigateTo` to `push`](#change-navigateto-to-push)
- [Remove inlined CSS in `html.js`](#remove-inlined-css-in-htmljs)
- [Only allow defined keys on node.internal object](#only-allow-defined-keys-on-the-node-internal-object)
- [Import `graphql` types from `gatsby/graphql`](#import-graphql-types-from-gatsbygraphql)
- [Move `Babel Configuration`](#move-babel-configuration)
- [Explicit query names no longer required](#explicit-query-names-no-longer-required)
- [Plugin specific changes](#plugin-specific-changes)

You can start with a few of the most important steps - install Gatsby v2 dependencies and update your layout components.

## Update Gatsby version

Update your `package.json` to use the pre-release versions of Gatsby.

`package.json`

```json
"dependencies": {
  "gatsby": "next",
  "gatsby-image": "next",
  "gatsby-plugin-sharp": "next"
}
```

> Note: Gatsby v2 is in pre-release so you may encounter further breaking changes.

## Update Gatsby related packages

Update your `package.json` to use the pre-release versions of Gatsby related packages. Any package name that starts with `gatsby-` should be upgraded to use the `next` version. Note, this only applies to plugins managed in the gatsbyjs/gatsby repo. If you're using community plugins, they might not be upgraded yet. Check their repo for the status. Many plugins won't actually need upgraded so they very well might keep working. For example:

`package.json`

```json
"dependencies": {
    "gatsby-plugin-google-analytics": "next",
    "gatsby-plugin-netlify": "next",
    "gatsby-plugin-sass": "next",
}
```

## Manually install React

In v1, the `react` and `react-dom` packages were included as part of the `gatsby` package. They are now `peerDependencies` so you are required to install them into your project.

```bash
npm i react react-dom
```

## Manually install plugins’ peer dependencies

Some plugins had dependencies that were also made peerDependencies. For example, if you use [`gatsby-plugin-typography`](https://www.gatsbyjs.org/packages/gatsby-plugin-typography/), you now need to install:

```bash
npm i typography react-typography
```

Search for the plugins that you use in the [plugin library](/plugins) and check their installation instructions for additional packages that now need installed.

## Update layout component

The special layout component (`src/layouts/index.js`) that Gatsby v1 used to wrap every page has been removed. If the layout of your site appears to be broken, this is most likely the reason why.

To learn more about the considerations behind this removal, read the [RFC for removing the special layout component](https://github.com/gatsbyjs/rfcs/blob/master/text/0002-remove-special-layout-components.md).

The following is the recommended migration path:

### 1. Convert children from function to normal prop (required)

In v1, the `children` prop passed to layout was a function and needed to be executed. In v2, this is no longer the case.

```diff
import React from "react"

export default ({ children }) => (
  <div>
-    {children()}
+    {children}
  </div>
)
```

### 2. Move `layouts/index.js` to `src/components/layout.js` (optional, but recommended)

```bash
git mv src/layouts/index.js src/components/layout.js
```

### 3. Import and wrap pages with layout component

Adhering to normal React composition model, you import the layout component and use it to wrap the content of the page.

`src/pages/index.js`

```jsx
import React from "react"
import Layout from "../components/layout"

export default () => (
  <Layout>
    <div>Hello World</div>
  </Layout>
)
```

Repeat for every page and template that needs this layout.

### 4. Change query to use `StaticQuery`

Since layout is no longer special, you now need to make use of v2’s [StaticQuery feature](/docs/static-query/).

Replacing a layout's query with `StaticQuery`:

`layout.js`

```diff
import React, { Fragment } from "react"
import Helmet from "react-helmet"
+ import { StaticQuery, graphql } from "gatsby"

- export default ({ children, data }) => (
-   <>
-     <Helmet titleTemplate={`%s | ${data.site.siteMetadata.title}`} defaultTitle={data.site.siteMetadata.title} />
-     <div>
-       {children()}
-     </div>
-   </>
- )
-
- export const query = graphql`
-   query LayoutQuery {
-     site {
-       siteMetadata {
-         title
-       }
-     }
-   }
- `
+ export default ({ children }) => (
+   <StaticQuery
+     query={graphql`
+       query LayoutQuery {
+         site {
+           siteMetadata {
+             title
+           }
+         }
+       }
+     `}
+     render={data => (
+       <>
+         <Helmet titleTemplate={`%s | ${data.site.siteMetadata.title}`} defaultTitle={data.site.siteMetadata.title} />
+         <div>
+           {children}
+         </div>
+       </>
+     )}
+   />
+ )
```

### 5. Pass `history`, `location`, and `match` props to layout

In v1, layout component had access to `history`, `location`, and `match` props. In v2, only pages have access to these props; pass them to your layout component as needed.

`layout.js`

```jsx
import React from "react"

export default ({ children, location }) => (
  <div>
    <p>Path is {location.pathname}</p>
    {children}
  </div>
)
```

`src/pages/index.js`

```jsx
import React from "react"
import Layout from "../components/layout.js"

export default props => (
  <Layout location={props.location}>
    <div>Hello World</div>
  </Layout>
)
```

## Import Link from Gatsby

All components and utility functions from `gatsby-link` are now exported from `gatsby` package. Therefore you should import it directly from `gatsby`.

```diff
import React from "react"
- import Link from "gatsby-link"
+ import { Link } from "gatsby"

export default props => (
  <Link to="/">Home</Link>
)
```

Furthermore you can remove the package from the `package.json`.

```diff
"dependencies": {
  "gatsby": "next",
  "gatsby-image": "next",
  "gatsby-plugin-sharp": "next",
- "gatsby-link": "^1.6.39"
}
```

## Import graphql from Gatsby

The `graphql` tag function that Gatsby v1 auto-supports is deprecated in v2. Gatsby will throw deprecation warning unless you explicitly import it from the `gatsby` package.

```diff
import React from "react"
+ import { graphql } from "gatsby"

export default ({ data }) => (
  <h1>{data.site.siteMetadata.title}</h1>
)

export const query = graphql`
  query HomeQuery {
    site {
      siteMetadata {
        title
      }
    }
  }
`
```

## Rename `boundActionCreators` to `actions`

`boundActionCreators` is deprecated in v2. You can continue using it, but it’s recommended that you rename it to `actions`.

> TODO: document new actions - see [actions](/docs/actions)

## Rename `pathContext` to `pageContext`

Similar to `boundActionCreators` above, `pathContext` is deprecated in favor of `pageContext`.

## Rename responsive image queries

The `sizes` and `resolutions` queries are deprecated in v2. These queries have been renamed to `fluid` and `fixed` to make them easier to understand. You can continue using the deprecated query names, but it's recommended that you update them.

Update image query and fragment names:

```diff
const Example = ({ data }) => {
  <div>
-    <Img sizes={data.foo.childImageSharp.sizes} />
-    <Img resolutions={data.bar.childImageSharp.resolutions} />
+    <Img fluid={data.foo.childImageSharp.fluid} />
+    <Img fixed={data.bar.childImageSharp.fixed} />
  </div>
}

export default Example

export const pageQuery = graphql`
  query IndexQuery {
    foo: file(relativePath: { regex: "/foo.jpg/" }) {
      childImageSharp {
-        sizes(maxWidth: 700) {
-          ...GatsbyImageSharpSizes_tracedSVG
+        fluid(maxWidth: 700) {
+          ...GatsbyImageSharpFluid_tracedSVG
        }
      }
    }
    bar: file(relativePath: { regex: "/bar.jpg/" }) {
      childImageSharp {
-        resolutions(width: 500) {
-          ...GatsbyImageSharpResolutions_withWebp
+        fixed(width: 500) {
+          ...GatsbyImageSharpFixed_withWebp
        }
      }
    }
  }
`
```

Further examples can be found in the [Gatsby Image docs](https://github.com/gatsbyjs/gatsby/tree/d0e29272ed7b009dae18d35d41a45e700cdcab0d/packages/gatsby-image).

## Manually specify PostCSS plugins

Gatsby v2 removed `postcss-cssnext` and `postcss-import` from the default PostCSS setup.

To have the same configuration that you had in v1, you should use [`gatsby-plugin-postcss`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-plugin-postcss) and follow the recommended migration path below.

### 1. Install the dependencies

`npm install --save gatsby-plugin-postcss postcss-import postcss-cssnext postcss-browser-reporter postcss-reporter`

**NOTE**: `postcss-cssnext` is [deprecated](https://moox.io/blog/deprecating-cssnext/) and it is better to use `postcss-preset-env` now.

### 2. Include `gatsby-plugin-postcss` in your `gatsby-config.js` file

```js
// in gatsby-config.js
plugins: [`gatsby-plugin-postcss`],
```

### 3. Include PostCSS plugins in your `postcss.config.js` file

```js
// in postcss.config.js
const postcssImport = require(`postcss-import`);
const postcssCssNext = require(`postcss-cssnext`);
const postcssBrowserReporter = require(`postcss-browser-reporter`);
const postcssReporter = require(`postcss-reporter`);

module.exports = () => ({
  plugins: [
    postcssImport(),
    postcssCssNext(),
    postcssBrowserReporter(),
    postcssReporter(),
  ],
})
```

## Convert to either pure CommonJS or pure ES6

Gatsby v2 uses babel 7 which is stricter about parsing files with mixed JS styles.

ES6 Modules are ok:

```js
// GOOD: ES modules syntax works
import foo from "foo"
export default foo
```

CommonJS is ok:

```js
// GOOD: CommonJS syntax works
const foo = require("foo")
module.exports = foo
```

Mixing `requires` and `export` is not ok:

```js
// BAD: Mixed ES and CommonJS module syntax will cause failures
const foo = require("foo")
export default foo
```

Mixing `import` and `module.exports` is not ok:

```js
// BAD: Mixed ES and CommonJS module syntax will cause failures
import foo from "foo"
module.exports = foo
```

See [Gatsby's babel docs for more details](/docs/babel).

## Don't query nodes by ID

Source and transformer plugins now use UUIDs for IDs. If you used glob or regex to query nodes by id then you'll need to query something else.

Here's an example querying an image:

```diff
  query MyImageQuery {
    allImageSharp(filter: {
-     id: {regex: "/default.jpg/"}
+     fluid: {originalName: {regex: "/default.jpg/"}}
    }) {
      edges {
        node {
          id
          fluid(maxWidth: 660) {
            src
          }
        }
      }
    }
  }
```

[See the Pull Request that implemented this change](https://github.com/gatsbyjs/gatsby/pull/3807/files)

## Remove explicit polyfills

If your Gatsby v1 site included any polyfills, you can remove them. Gatsby v2 ships with babel 7 and is configured to automatically include polyfills for your code. See [Gatsby's babel docs for more details](/docs/babel).

> Note: This works for your own code, but is not yet implemented for code imported from `node_modules`. Track progress of this feature at [bullet 5 of this issue](https://github.com/gatsbyjs/gatsby/issues/3870).

## Change `modifyBabelrc` to `onCreateBabelConfig`

`modifyBabelrc` was renamed to [`onCreateBabelConfig`](/docs/node-apis/#modifyBabelrc) to bring it in line with the rest of Gatsby's API names.

Use `onCreateBabelConfig`:

```diff
- exports.modifyBabelrc = ({ babelrc }) => {
-   return {
-     ...babelrc,
-     plugins: babelrc.plugins.concat([`foo`]),
-   }
+ exports.onCreateBabelConfig = ({ actions }) => {
+   actions.setBabelPlugin({
+     name: `babel-plugin-foo`,
+   })
}
```

Note usage of the new [`setBabelPlugin` action](/docs/actions/#setBabelPlugins).

See [Gatsby's babel docs for more details](/docs/babel) about configuring babel.

## Change `modifyWebpackConfig` to `onCreateWebpackConfig`

`modifyWebpackConfig` was renamed to [`onCreateWebpackConfig`](/docs/node-apis/#onCreateWebpackConfig) to bring it in line with the rest of Gatsby's API names.

Use `onCreateWebpackConfig`:

```diff
- exports.modifyWebpackConfig = ({ config, stage }) => {
+ exports.onCreateWebpackConfig = ({ stage, actions }) => {
  switch (stage) {
    case `build-javascript`:
-       config.plugin(`Foo`, webpackFooPlugin, null)
-       break
-   }
-   return config
+       actions.setWebpackConfig({
+         plugins: [webpackFooPlugin],
+       })
+   }
}
```

Note usage of the new [`setWebpackConfig` action](/docs/actions/#setWebpackConfig).

See [Gatsby's webpack docs for more details](/docs/add-custom-webpack-config) about configuring webpack.

## Change `navigateTo` to `push`

The `navigateTo` method in `gatsby-link` was renamed to `push` so as to mirror the browser history function. We also
added support for using `replace` as well.

In addition to the name change, `gatsby-link` is now directly exported from the `gatsby` package.

```diff
import React from "react"
- import { navigateTo } from "gatsby-link"
+ import { push } from "gatsby"

// Don't use push with an onClick btw :-)
// Generally just use the `<Link>` component.
export default props => (
-  <div onClick={() => navigateTo(`/`)}>Click to go to home</div>
+  <div onClick={() => push(`/`)}>Click to go to home</div>
)
```

## Remove inlined CSS in `html.js`

Gatsby v2 automatically inlines CSS. You can remove any custom CSS inlining from your custom `html.js`.

See an example in [this PR that upgrades the `using-remark` site to Gatsby v2](https://github.com/gatsbyjs/gatsby/commit/765b679cbc222fd5f527690427ee431cca7ccd61#diff-637c76e3c059ed8efacedf6e30de2d61).

## Only allow defined keys on the node internal object

The node internal object isn't meant for adding node data. Those should be added to the top-level object. We
didn't document this in v1 nor validate against it but are now for v2.

## Import `graphql` types from `gatsby/graphql`

Import graphql types from `gatsby/graphql` to prevent `Schema must contain unique named types but contains multiple types named "<typename>"` errors. `gatsby/graphql` exports all builtin GraphQL types as well as `graphQLJSON` type.

```diff
-const { GraphQLString } = require(`graphql`)
+const { GraphQLString } = require(`gatsby/graphql`)
```

## Move Babel Configuration

The latest version of Gatsby uses Babel 7, which introduced [a new behavior for configuration lookup / resolution](https://github.com/babel/babel/issues/6766). In the case where a _.babelrc_ file might have been used at the root of the project, like for configuring Jest, moving that Babel configuration into _jest.config.json_ will avoid any conflicts.

[This GitHub comment](https://github.com/facebook/jest/issues/1468#issuecomment-361260279) documents the steps needed to do that.

More information on Gatsby and Babel configuration available [here](/docs/babel/#how-to-use-a-custom-babelrc-file).

## Explicit query names no longer required

Gatsby v2 doesn't require explicit query names. You can skip them now:

```diff
export const query = graphql`
-  query ThisIsExplicitQueryName($slug: String!) {
+  query($slug: String!) {
    markdownRemark(fields: { slug: { eq: $slug } }) {
      html
      frontmatter {
        title
      }
    }
  }
```

You can also skip the `query` keyword if you don't use query variables:

```diff
export const query = graphql`
-  query ThisIsAnotherExplicitQueryName {
+  {
    site {
      siteMetadata {
        title
      }
    }
  }
```

This isn't a breaking change. Queries with explicit names will continue to work as they did in v1.

## Plugin specific changes

Some plugins require additional changes before your site will compile.
For example, if you use [`gatsby-plugin-typography`](https://www.gatsbyjs.org/packages/gatsby-plugin-typography/), you now need to explicitly export `scale` and `rhythm` as named exports from your typography config module.

`src/utils/typography.js`

```diff
- const typography = new Typography();
- export default typography;

+ const typography = new Typography();
+ const { rhythm, scale } = typography;
+ export { rhythm, scale, typography as default };
```

### createRemoteFileNode

The signature for using createRemoteFileNode changed in v2, it now expects a new parameter `createNodeId`.

[See docs for `createRemoteFileNode`](https://github.com/gatsbyjs/gatsby/tree/master/packages/gatsby-source-filesystem#createremotefilenode)
