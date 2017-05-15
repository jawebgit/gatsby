import apiRunner from "./api-runner-browser"
// Let the site/plugins run code very early.
apiRunner(`clientEntry`)

import React from "react"
import ReactDOM from "react-dom"
import {
  BrowserRouter as Router,
  Route,
  withRouter,
  matchPath,
} from "react-router-dom"
import { ScrollContext } from "react-router-scroll"
import createHistory from "history/createBrowserHistory"
import pages from "./pages.json"
window.matchPath = matchPath

import requires from "./async-requires"

// Load scripts
const preferDefault = m => (m && m.default) || m
const scriptsCache = {}
const loadScriptsForPath = (path, cb = () => {}) => {
  if (!path) {
    return cb()
  }

  if (scriptsCache[path]) {
    return cb(scriptsCache[path])
  }

  const page = pages.find(r => r.path === path)

  if (!page) {
    return cb()
  }

  let scripts = {
    layout: false,
    component: false,
    pageData: false,
  }
  const loaded = () => {
    if (scripts.layout && scripts.component && scripts.pageData) {
      scriptsCache[path] = scripts
      cb(scripts)
    }
  }
  requires.layouts.index(layout => {
    scripts.layout = preferDefault(layout)
    loaded()
  })
  requires.components[page.componentChunkName](component => {
    scripts.component = preferDefault(component)
    loaded()
  })
  requires.json[page.jsonName](pageData => {
    scripts.pageData = pageData
    loaded()
  })
}

const navigateTo = pathname => {
  loadScriptsForPath(pathname, () => {
    window.___history.push(pathname)
  })
}

window.___loadScriptsForPath = loadScriptsForPath
window.___navigateTo = navigateTo

const history = createHistory()
history.listen((location, action) => {
  apiRunner(`onRouteUpdate`, location, action)
})

function shouldUpdateScroll(prevRouterProps, { location: { pathname } }) {
  const results = apiRunner(`shouldUpdateScroll`, {
    prevRouterProps,
    pathname,
  })
  if (results.length > 0) {
    return results[0]
  }

  if (prevRouterProps) {
    const { location: { pathname: oldPathname } } = prevRouterProps
    if (oldPathname === pathname) {
      return false
    }
  }
  return true
}

// Load 404 page component and scripts
let notFoundScripts
loadScriptsForPath(`/404.html`, scripts => {
  notFoundScripts = scripts
})

const renderPage = props => {
  const page = pages.find(page => {
    if (page.matchPath) {
      // Try both the path and matchPath
      return (
        matchPath(props.location.pathname, { path: page.path }) ||
        matchPath(props.location.pathname, {
          path: page.matchPath,
        })
      )
    } else {
      return matchPath(props.location.pathname, {
        path: page.path,
        exact: true,
      })
    }
  })
  if (page) {
    return $(scriptsCache[page.path].component, {
      ...props,
      ...scriptsCache[page.path].pageData,
    })
  } else if (notFoundScripts) {
    return $(notFoundScripts.component, {
      ...props,
      ...notFoundScripts.pageData,
    })
  } else {
    return null
  }
}

const renderSite = ({ scripts, props }) => {
  return $(scripts.layout, { ...props }, renderPage(props))
}

const $ = React.createElement

const AltRouter = apiRunner(`replaceRouterComponent`, { history })[0]
const DefaultRouter = ({ children }) => (
  <Router history={history}>{children}</Router>
)

loadScriptsForPath(window.location.pathname, scripts => {
  const Root = () =>
    $(
      AltRouter ? AltRouter : DefaultRouter,
      null,
      $(
        ScrollContext,
        { shouldUpdateScroll },
        $(withRouter(scripts.layout), {
          children: layoutProps => {
            return $(Route, {
              render: routeProps => {
                window.___history = routeProps.history
                const props = layoutProps ? layoutProps : routeProps
                return renderPage(props)
              },
            })
          },
        })
      )
    )

  const NewRoot = apiRunner(`wrapRootComponent`, { Root }, Root)[0]
  ReactDOM.render(
    <NewRoot />,
    typeof window !== `undefined`
      ? document.getElementById(`___gatsby`)
      : void 0
  )
})
