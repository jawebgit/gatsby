require('node-cjsx').transform()
import Hapi from 'hapi'
import Boom from 'boom'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import WebpackDevServer from 'webpack-dev-server'
import webpack from 'webpack'
import Negotiator from 'negotiator'
import parsePath from 'parse-filepath'
import _ from 'underscore'
import webpackRequire from 'webpack-require'
import fs from 'fs'
import getUserGatsbyConfig from './get-user-gatsby-config'
import globPages from './glob-pages'
import webpackConfig from './webpack.config'

module.exports = (program) => {
  const directory = program.directory

  // Load pages for the site.
  return globPages(directory, (err, pages) => {
    // Generate random port for webpack to listen on.
    // Perhaps should check if port is open.
    const webpackPort = Math.round(Math.random() * 1000 + 1000)

    const compilerConfig = webpackConfig(program, directory, 'develop', webpackPort)
    const config = getUserGatsbyConfig(compilerConfig, 'develop')

    const compiler = webpack(config.resolve())

    let HTMLPath
    if (fs.existsSync(directory + '/html.cjsx') || fs.existsSync(directory + '/html.jsx')) {
      HTMLPath = directory + '/html'
    } else {
      HTMLPath = __dirname + '/../isomorphic/html'
    }

    const htmlCompilerConfig = webpackConfig(program, directory, 'production', webpackPort)
    const htmlConfig = getUserGatsbyConfig(htmlCompilerConfig, 'production')

    webpackRequire(htmlConfig.resolve(), require.resolve(HTMLPath), (error, factory) => {
      if (error) {
        console.log('Failed to require ' + directory + '/html.jsx')
        error.forEach((e) => {
          console.log(e)
        })
        process.exit()
      }
      const HTML = factory()

      const webpackDevServer = new WebpackDevServer(compiler, {
        hot: true,
        quiet: true,
        noInfo: true,
        host: program.host,
        stats: {
          colors: true,
        },
      })

      // Start webpack-dev-server
      webpackDevServer.listen(webpackPort, program.host, () => {
      })

      // Setup and start Hapi to serve html + static files.
      const server = new Hapi.Server()
      server.connection({
        host: program.host,
        port: program.port,
      })

      server.route({
        method: 'GET',
        path: '/bundle.js',
        handler: {
          proxy: {
            uri: 'http://localhost:' + webpackPort + '/bundle.js',
            passThrough: true,
            xforward: true,
          },
        },
      })

      server.route({
        method: 'GET',
        path: '/html/{path*}',
        handler: (request, reply) => {
          if (request.path === 'favicon.ico') {
            return reply(Boom.notFound())
          }

          let html = ReactDOMServer.renderToStaticMarkup(React.createElement(HTML))
          html = '<!DOCTYPE html>\n' + html
          return reply(html)
        },
      })

      server.route({
        method: 'GET',
        path: '/{path*}',
        handler: {
          directory: {
            path: directory + '/pages',
            listing: false,
            index: false,
          },
        },
      })

      server.ext('onRequest', (request, reply) => {
        const negotiator = new Negotiator(request.raw.req)

        if (negotiator.mediaType() === 'text/html') {
          request.setUrl('/html' + request.path)
          reply.continue()
        } else {
          // Rewrite path to match disk path.
          const parsed = parsePath(request.path)
          const page = _.find(pages, (p) => {
            return p.path === (parsed.dirname + '/')
          })

          if (page) {
            request.setUrl('/' + parsePath(page.requirePath).dirname + '/' + parsed.basename)
          }

          return reply.continue()
        }
      })

      return server.start((e) => {
        if (e) {
          console.log(e)
        }
        return console.log('Listening at:', server.info.uri)
      })
    })
  })
}
