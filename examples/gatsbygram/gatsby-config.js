module.exports = {
  siteMetadata: {
    title: `GatsbyGram`,
  },
  plugins: [
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `pages`,
        path: `${__dirname}/pages`,
      },
    },
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `data`,
        path: `${__dirname}/data`,
      },
    },
    `gatsby-plugin-sharp`,
    `gatsby-parser-sharp`,
    `gatsby-parser-json`,
    `gatsby-typegen-filesystem`,
    `gatsby-typegen-sharp`,
    `gatsby-plugin-glamor`,
  ],
}
