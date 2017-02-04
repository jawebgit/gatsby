import Typography from 'typography'
import CodePlugin from 'typography-plugin-code'
import { MOBILE_MEDIA_QUERY } from 'typography-breakpoint-constants'

const options = {
  headerFontFamily: [`Futura PT`, `sans-serif`],
  bodyFontFamily: [`Tex Gyre Schola`, `serif`],
  baseFontSize: `17px`,
  baseLineHeight: 1.4,
  headerColor: `#44421f`,
  bodyColor: `#44421f`,
  blockMarginBottom: 0.75,
  scaleRatio: 2.15,
  plugins: [
    new CodePlugin(),
  ],
  overrideStyles: ({ rhythm }) => ({
    body: {
      background: `#f7f0eb`,
    },
    'h1,h2,h4,h5,h6': {
      lineHeight: 1,
      marginTop: rhythm(1.5),
      marginBottom: rhythm(3/4),
    },
    ul: {
      marginTop: rhythm(1/2),
    },
    h3: {
      fontWeight: 400,
      fontStyle: `italic`,
      lineHeight: 1,
      marginTop: rhythm(1),
      marginBottom: rhythm(1/2),
    },
    'tt,code': {
      background: `hsla(23, 60%, 97%, 1)`,
      fontFamily: `"Space Mono",Consolas,"Roboto Mono","Droid Sans Mono","Liberation Mono",Menlo,Courier,monospace`,
      fontSize: `80%`,
      // Disable ligatures as they look funny w/ Space Mono as code.
      fontVariant: `none`,
      WebkitFontFeatureSettings: `"clig" 0, "calt" 0`,
      fontFeatureSettings: `"clig" 0, "calt" 0`,
      paddingTop: `0.1em`,
      paddingBottom: `0.1em`,
    },
    pre: {
      background: `hsla(23, 60%, 97%, 1)`,
      border: `1px solid #eddad4`,
      fontSize: `100%`,
      lineHeight: 1,
    },
    'pre code': {
      lineHeight: 1.32,
    },
    '.main-body a': {
      color: `inherit`,
      textDecoration: `none`,
      transition: `background 0.4s ease-out`,
      borderBottom: `1px solid #d7e7ee`,
      boxShadow: `inset 0 -5px 0px 0px #d7e7ee`,
    },
    '.main-body a:hover': {
      background: `#d7e7ee`,
    },
    '.main-body a.anchor': {
      color: `inherit`,
      textDecoration: `none`,
      borderBottom: `none`,
      boxShadow: `none`,
    },
    '.main-body a.anchor:hover': {
      background: `none`,
    },
    [MOBILE_MEDIA_QUERY]: {
      // Make baseFontSize on mobile 18px.
      html: {
        fontSize: `${15/16 * 100}%`,
      },
    },
  }),
}

const typography = new Typography(options)

// Hot reload typography in development.
if (process.env.NODE_ENV !== 'production') {
  typography.injectStyles()
}

export default typography
