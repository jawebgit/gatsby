import { oneLine, stripIndent } from "common-tags"
import React from "react"

exports.onRenderBody = (
  { setHeadComponents, setPreBodyComponents, setPostBodyComponents },
  pluginOptions
) => {
  if (
    process.env.NODE_ENV === `production` ||
    pluginOptions.includeInDevelopment
  ) {
    const environmentParamStr =
      pluginOptions.gtmAuth && pluginOptions.gtmPreview
        ? oneLine`
      &gtm_auth=${pluginOptions.gtmAuth}&gtm_preview=${
            pluginOptions.gtmPreview
          }&gtm_cookies_win=x
    `
        : ``

    const setComponents = pluginOptions.addTagInBody
      ? setPostBodyComponents
      : setHeadComponents
    setComponents([
      <script
        key="plugin-google-tagmanager"
        dangerouslySetInnerHTML={{
          __html: stripIndent`
            (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
            new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
            j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
            'https://www.googletagmanager.com/gtm.js?id='+i+dl+'${environmentParamStr}';f.parentNode.insertBefore(j,f);
            })(window,document,'script','${pluginOptions.dataLayerName ||
              `dataLayer`}', '${pluginOptions.id}');`,
        }}
      />,
    ])

    // TODO: add a test to verify iframe contains no line breaks. Ref: https://github.com/gatsbyjs/gatsby/issues/11014
    setPreBodyComponents([
      <noscript
        key="plugin-google-tagmanager"
        dangerouslySetInnerHTML={{
          __html: stripIndent`
            <iframe src="https://www.googletagmanager.com/ns.html?id=${
              pluginOptions.id
            }${environmentParamStr}" height="0" width="0" style="display: none; visibility: hidden"></iframe>`,
        }}
      />,
    ])
  }
}
