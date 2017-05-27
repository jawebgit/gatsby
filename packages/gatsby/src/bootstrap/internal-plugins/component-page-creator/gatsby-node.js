const globCB = require(`glob`)
const Promise = require(`bluebird`)
const _ = require(`lodash`)
const chokidar = require(`chokidar`)
const systemPath = require(`path`)

const glob = Promise.promisify(globCB)

const createPath = require(`./create-path`)

// Path creator.
// Auto-create pages.
// algorithm is glob /pages directory for js/jsx/cjsx files *not*
// underscored. Then create url w/ our path algorithm *unless* user
// takes control of that page component in gatsby-node.
exports.createPagesStateful = async ({ store, boundActionCreators }) => {
  const { upsertPage, deletePageByPath } = boundActionCreators
  const program = store.getState().program
  const pagesDirectory = systemPath.posix.join(program.directory, `/src/pages`)
  const exts = program.extensions.map(e => `${e.slice(1)}`).join(`,`)

  // Get initial list of files.
  let files = await glob(`${pagesDirectory}/**/?(${exts})`)
  files.forEach(file => createPage(file, pagesDirectory, upsertPage))

  // Listen for new component pages to be added or removed.
  chokidar
    .watch(`${pagesDirectory}/**/*.{${exts}}`)
    .on(`add`, path => {
      if (!_.includes(files, path)) {
        createPage(path, pagesDirectory, upsertPage)
        files.push(path)
      }
    })
    .on(`unlink`, path => {
      // Delete the page for the now deleted component.
      store.getState().pages.filter(p => p.component === path).forEach(page => {
        deletePageByPath(page.path)
        files = files.filter(f => f !== path)
      })
    })
}
const createPage = (filePath, pagesDirectory, upsertPage) => {
  // Filter out special components that shouldn't be made into
  // pages.
  if (!validatePath(systemPath.posix.relative(pagesDirectory, filePath))) {
    return
  }

  // Create page object
  const page = {
    path: createPath(pagesDirectory, filePath),
    component: filePath,
  }

  // Add page
  upsertPage(page)
}

const validatePath = path => {
  // Disallow paths starting with an underscore
  // and template-.
  const parsedPath = systemPath.parse(path)
  return (
    parsedPath.name.slice(0, 1) !== `_` &&
    parsedPath.name.slice(0, 9) !== `template-`
  )
}

exports.validatePath = validatePath
