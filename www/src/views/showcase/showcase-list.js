import React from "react"
import { Link } from "gatsby"
import Img from "gatsby-image"
import hex2rgba from "hex2rgba"
import { style } from "glamor"

import { options, scale, rhythm } from "../../utils/typography"
import presets, { colors } from "../../utils/presets"

const ShowcaseList = ({ items, count }) => {
  if (count) items = items.slice(0, count)

  return (
    <div
      css={{
        display: `flex`,
        flexWrap: `wrap`,
        padding: rhythm(3 / 4),
        justifyContent: `center`,
        [presets.Desktop]: {
          justifyContent: `flex-start`,
        },
      }}
    >
      {items.map(
        ({ node }) =>
          node.fields &&
          node.fields.slug && ( // have to filter out null fields from bad data
            <Link
              key={node.id}
              to={{ pathname: node.fields.slug, state: { isModal: true } }}
              {...styles.withTitleHover}
              css={{
                margin: rhythm(3 / 4),
                width: 280,
                "&&": {
                  borderBottom: `none`,
                  boxShadow: `none`,
                  transition: `all ${presets.animation.speedDefault} ${
                    presets.animation.curveDefault
                  }`,
                  "&:hover": {
                    ...styles.screenshotHover,
                  },
                },
              }}
            >
              {node.childScreenshot ? (
                <Img
                  resolutions={
                    node.childScreenshot.screenshotFile.childImageSharp
                      .resolutions
                  }
                  alt={`Screenshot of ${node.title}`}
                  css={{
                    ...styles.screenshot,
                  }}
                />
              ) : (
                <div
                  css={{
                    width: 320,
                    backgroundColor: `#d999e7`,
                  }}
                >
                  missing
                </div>
              )}
              <div>
                <span className="title">{node.title}</span>
              </div>
              <div
                css={{
                  ...scale(-2 / 5),
                  color: `#9B9B9B`,
                  fontWeight: `normal`,
                }}
              >
                {node.categories && node.categories.join(`, `)}
              </div>
            </Link>
          )
      )}
    </div>
  )
}

export default ShowcaseList

const styles = {
  withTitleHover: style({
    "& .title": {
      transition: `box-shadow .3s cubic-bezier(.4,0,.2,1), transform .3s cubic-bezier(.4,0,.2,1)`,
      boxShadow: `inset 0 0px 0px 0px ${colors.ui.whisper}`,
    },
    "&:hover .title": {
      boxShadow: `inset 0 -3px 0px 0px ${colors.ui.bright}`,
    },
  }),
  screenshot: {
    borderRadius: presets.radius,
    boxShadow: `0 4px 10px ${hex2rgba(colors.gatsby, 0.1)}`,
    marginBottom: rhythm(options.blockMarginBottom / 2),
    transition: `all ${presets.animation.speedDefault} ${
      presets.animation.curveDefault
    }`,
  },
  screenshotHover: {
    background: `transparent`,
    color: colors.gatsby,
    "& .gatsby-image-wrapper": {
      transform: `translateY(-3px)`,
      boxShadow: `0 8px 20px ${hex2rgba(colors.lilac, 0.5)}`,
    },
  },
}
