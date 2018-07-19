---
title: Site Showcase Submissions
---

Want to submit a site to the site showcase? Follow these instructions.

# Steps

There are only two major steps :)

1.  If there is a chance that someone else could have already submitted the site, please make sure no one else has already submitted it by searching existing PRs: https://github.com/gatsbyjs/gatsby/pulls

2.  Edit the [`sites.yml`](https://github.com/gatsbyjs/gatsby/blob/master/docs/sites.yml) file by adding your submission to the bottom of the list of sites in the following format:

```shell
- title: Title of the Site
  main_url: 'http://titleofthesite.com/' //this is the URL that the screenshot comes from//
  url: 'http://titleofthesite.co.uk/'
  featured: false //leave as false, the Gatsby team will choose featured sites quarterly//
  description: >-
    This description will appear in the modal detail view and permalink views for your site.
  categories:
    - Relevant category 1
    - Relevant category 2
    - // You can list as many categories as you want here //
    - // If you'd like to create a new category, simply list it here //
  built_by: Name of creator(s) or team/agency/business that created the site
  built_by_url: 'https://twitter.com/creatorname' //this could also be the URL to the site of your portfolio, your agency or company's site, etc.//
```

# Helpful information

## Categories

Categories currently include both _type of site_ (structure) and the _content of the site_. You will place all these under "categories" in your submission for now. The reason these are in two separate lists here is to show that you can have a school's marketing site (type of site would be marketing, and content would be education) or a site that delivers online learning about marketing (type of site would be education and content would be marketing).

### Type of site

- Blog
- Directory
- Documentation
- eCommerce
- Education
- Gallery
- Landing
- Marketing
- Portfolio
- [feel free to create new ones after checking to make sure the tag you want doesn't already exist]

### Content of site:

A few notes on site content: a common question is this: "aren't all Gatsby sites technically in the "web dev" category?" Well, no because this category means the _content_ of the site has to be about web development, like [ReactJS](https://reactjs.org/). Also, the difference between technology and web dev is like this. [Cardiiogram](https://cardiogr.am/) is technology, while [ReactJS](https://reactjs.org/) is web dev.

- Agency
- Corporate
- Cinema
- Creative
- Education
- Entertainment
- Finance
- Food
- Healthcare
- Hosting
- Gallery
- Government
- Magazine
- Marketing
- Miscellaneous
- Music
- News
- Nonprofit
- Open Source
- Personal
- Photography
- Podcast
- Real Estate
- Retail
- Technology
- Web Dev

## Note on Featured Sites

Featured sites will be chosen quarterly based on the following criteria:

- how the site performs according to a set of criteria TBD by a group (also TBD)
- voting by the community

### How to Set a Site as Featured

_Note: the Gatsby team will choose featured sites, leave as `featured: false` when first posting_

1.  Change `featured: false` to `featured: true`

2.  Add `featured` as a category:

```shell
categories:
  - featured
```

## Change your mind / need to edit your submission?

If you want to edit anything in your site submission later, simply edit the .yml file by submitting another PR.
