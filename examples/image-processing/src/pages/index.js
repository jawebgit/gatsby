import React from "react"
import Img from "gatsby-image"

import { rhythm } from "../utils/typography"

class Index extends React.Component {
  render() {
    const images = this.props.data.allImageSharp.edges
    const sizes = this.props.data.sizes.sizes
    const resolutions = this.props.data.resolution.resolutions
    const cropDefault = this.props.data.cropDefault.resize
    const cropBottomLeft = this.props.data.cropBottomLeft.resize
    const cropEntropy = this.props.data.cropEntropy.resize
    const cropCenter = this.props.data.cropCenter.resize

    return (
      <div>
        <p>
          <a href="https://www.gatsbyjs.org/packages/gatsby-transformer-sharp/">
            <code>gatsby-transformer-sharp</code>
          </a>
          {` `}
          exposes several image processing GraphQL functions built on the
          {` `}
          <a href="https://github.com/lovell/sharp">
            Sharp image processing library
          </a>. With it and{` `}
          <a href="https://www.gatsbyjs.org/packages/gatsby-image/">
            Gatsby Image
          </a>
          {` `}
          you can easily add fast, optimized, responsive images to your site.
        </p>
        <p>
          <strong>
            Consult the
            {` `}
            <a href="https://www.gatsbyjs.org/packages/gatsby-plugin-sharp/">
              documentation
            </a>
            {` `}
            or peep the code of this example site for more information.
          </strong>
        </p>

        <h2
          style={{
            clear: `left`,
            paddingTop: rhythm(2),
          }}
        >
          <a href="https://www.gatsbyjs.org/packages/gatsby-plugin-sharp/#resize">
            <code>
              <strong>resize</strong>
            </code>
          </a>
        </h2>

        <p>
          Easily resize and intelligently crop images given a
          {` `}
          <code>width</code>
          {` `}
          and optionally a <code>height</code>.
        </p>

        <p>
          The
          {` `}
          <code>rotate</code> option
          {` `}
          exposes Sharp{`'`}s
          {` `}
          <a href="http://sharp.dimens.io/en/stable/api-operation/#rotate">
            <code>rotate</code>
          </a>
          {` `}.
        </p>

        <h3>
          <code>
            <small>resize(width: 125, height: 125, rotate: 180)</small>
          </code>
        </h3>

        <ul style={styles.ul}>
          {images.map(image => (
            <li style={styles.thumbnail} key={image.node.resize.src}>
              <img src={image.node.resize.src} />
            </li>
          ))}
        </ul>

        <p
          style={{
            clear: `left`,
          }}
        >
          We also expose all of Sharp
          {`'`}
          s
          {` `}
          <a href="http://sharp.dimens.io/en/stable/api-resize/#crop">
            <code>crop</code>
          </a>
          {` `}
          options with <code>cropFocus</code>.
        </p>
        <p>
          The default is
          <code>ATTENTION</code>, which the Sharp documentation describes as
          {` "`}focus on the region with the highest luminance frequency, colour
          saturation and presence of skin tones{`"`} – which is why we actually
          see Mr. Gatsby toasting to us in the first thumbnail:
        </p>

        <ul style={styles.ul}>
          <li style={styles.thumbnail}>
            <img src={cropDefault.src} />
          </li>
          <li style={styles.thumbnail}>
            <img src={cropBottomLeft.src} />
            <p>
              <small>
                <code>cropFocus: SOUTHWEST</code>
              </small>
            </p>
          </li>
          <li style={styles.thumbnail}>
            <img src={cropEntropy.src} />
            <p>
              <small>
                <code>cropFocus: ENTROPY</code>
              </small>
            </p>
          </li>
          <li style={styles.thumbnail}>
            <img src={cropCenter.src} />
            <p>
              <small>
                <code>cropFocus: CENTER</code>
              </small>
            </p>
          </li>
        </ul>

        <h2
          style={{
            clear: `left`,
            paddingTop: rhythm(2),
          }}
        >
          <a href="https://www.gatsbyjs.org/packages/gatsby-plugin-sharp/#responsive-sizes">
            <code>
              <strong>sizes</strong>
            </code>
          </a>
        </h2>
        <p>
          For when you want an image that stretches across a fluid width
          container but will download the smallest image needed for the device
          e.g. a smartphone will download a much smaller image than a desktop
          device.
        </p>
        <p>
          If the max width of the container for the rendered markdown file is
          800px, the sizes would then be: 200, 400, 800, 1200, 1600, 2400 –
          enough to provide close to the optimal image size for every device
          size / screen resolution.
        </p>
        <p>
          On top of that, <code>sizes</code>
          {` `}
          returns everything else (namely
          {` `}
          <code>aspectRatio</code>
          {` `}
          and a
          {` `}
          <code>base64</code>
          {` `}
          image to use as a placeholder) you need to implement the "blur up"
          technique popularized by
          {` `}
          <a href="https://jmperezperez.com/medium-image-progressive-loading-placeholder/">
            Medium
          </a>
          {` `}
          and
          {` `}
          <a href="https://code.facebook.com/posts/991252547593574/the-technology-behind-preview-photos/">
            Facebook
          </a>
          {` `}
          (and also available as a Gatsby plugin for Markdown content as
          {` `}
          <a href="https://www.gatsbyjs.org/packages/gatsby-remark-images/">
            gatsby-remark-images
          </a>).
        </p>
        <p>
          The <code>duotone</code> option (see
          {` `}
          <a href="https://alistapart.com/article/finessing-fecolormatrix">I</a>
          ,
          {` `}
          <a href="http://blog.72lions.com/blog/2015/7/7/duotone-in-js">II</a>
          ,
          {` `}
          <a href="https://ines.io/blog/dynamic-duotone-svg-jade">III</a>
          ), given two hex colors
          {` `}
          <code>shadow</code>
          {` `}
          and <code>highlight</code> defining start and end color of the duotone
          gradient, converts the source image colors to match a gradient color
          chosen based on each pixels relative luminance.
        </p>

        <p>
          The <code>toFormat</code> option lets you convert the source image to
          another image format. We use "PNG" here to ensure that the duotoned
          image does not show any JPG artifacts.
        </p>

        <h3>
          <small>
            sizes(duotone:
            {` `}
            {`{ `}
            highlight: "#f00e2e", shadow: "#192550" {`}`}, toFormat: PNG)
          </small>
        </h3>
        <Img sizes={sizes} />
        <h2
          style={{
            paddingTop: rhythm(2),
          }}
        >
          <a href="https://www.gatsbyjs.org/packages/gatsby-plugin-sharp/#responsive-resolution">
            <code>resolutions</code>
          </a>
        </h2>
        <p>
          For when you want a fixed sized image but that has different sized
          thumbnails for screens that support different density of images
        </p>
        <p>
          Automatically create images for different resolutions — we do 1x,
          1.5x, 2x, and 3x.
          {` `}
        </p>

        <p>
          The
          {` `}
          <code>grayscale</code> option
          {` `}
          uses Sharp{`'`}s
          {` `}
          <a href="http://sharp.dimens.io/en/stable/api-colour/#greyscale">
            <code>greyscale</code>
          </a>
          {` `}
          to convert the source image to 8-bit greyscale, 256 shades of grey.
        </p>

        <Img resolutions={resolutions} />
      </div>
    )
  }
}

const styles = {}

styles.ul = {
  marginLeft: rhythm(-3 / 4),
  marginRight: rhythm(-3 / 4),
  padding: `0`,
  listStyle: `none`,
}

styles.thumbnail = {
  color: `#999`,
  float: `left`,
  marginLeft: rhythm(3 / 4),
  marginRight: rhythm(3 / 4),
  marginBottom: rhythm(6 / 4),
}

export default Index

export const pageQuery = graphql`
  query IndexQuery {
    allImageSharp {
      edges {
        node {
          ... on ImageSharp {
            resize(width: 125, height: 125, rotate: 180) {
              src
            }
          }
        }
      }
    }
    sizes: imageSharp(id: { regex: "/fecolormatrix-kanye-west.jpg/" }) {
      sizes(
        duotone: { highlight: "#f00e2e", shadow: "#192550" }
        toFormat: PNG
      ) {
        ...GatsbyImageSharpSizes
      }
    }
    resolution: imageSharp(id: { regex: "/lol.jpg/" }) {
      resolutions(grayscale: true, width: 500) {
        ...GatsbyImageSharpResolutions
      }
    }
    cropDefault: imageSharp(id: { regex: "/gatsby.jpg/" }) {
      resize(width: 180, height: 180) {
        src
      }
    }
    cropBottomLeft: imageSharp(id: { regex: "/nyancat/" }) {
      resize(width: 180, height: 180, cropFocus: SOUTHWEST) {
        src
      }
    }
    cropEntropy: imageSharp(id: { regex: "/gatsby.jpg/" }) {
      resize(width: 180, height: 180, cropFocus: ENTROPY) {
        src
      }
    }
    cropCenter: imageSharp(id: { regex: "/gatsby.jpg/" }) {
      resize(width: 180, height: 180, cropFocus: CENTER) {
        src
      }
    }
  }
`
