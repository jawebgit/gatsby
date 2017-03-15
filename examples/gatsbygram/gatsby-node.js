const _ = require("lodash")
const Promise = require("bluebird")
const path = require("path")
const slug = require("slug")

// Implement the Gatsby API “createPages”. This is
// called after the Gatsby bootstrap is finished so you have
// access to any information necessary to programatically
// create pages.
exports.createPages = ({ args }) =>
  new Promise((resolve, reject) => {
    // The “graphql” function allows us to run arbitrary
    // queries against this Gatsbygram's graphql schema. Think of
    // it like Gatsbygram has a built-in database constructed
    // from static data that you can run queries against.
    const { graphql } = args
    const pages = []
    // Post is a data node type derived from data/posts.json
    // which is created when scrapping Instagram. “allPosts”
    // is a "connection" (a GraphQL convention for accessing
    // a list of nodes) gives us an easy way to query all
    // Post nodes.
    graphql(
      `
      {
        allPosts(limit: 1000) {
          edges {
            node {
              id
            }
          }
        }
      }
    `
    ).then(result => {
      if (result.errors) {
        console.log(result.errors)
        reject(result.errors)
      }

      // Create image post pages.
      const postTemplate = path.resolve(`pages/template-post-page.js`)
      // We want to create a detailed page for each
      // Instagram post. Since the scrapped Instagram data
      // already includes an ID field, we just use that for
      // each page's path.
      _.each(result.data.allPosts.edges, edge => {
        pages.push({
          // Each page is required to have a `path` as well
          // as a template component. The `context` is
          // optional but is often necessary so the template
          // can query data specific to each page.
          path: slug(edge.node.id),
          component: postTemplate,
          context: {
            id: edge.node.id,
          },
        })
      })

      resolve(pages)
    })
  })
