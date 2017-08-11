const r = m => require.resolve(m)

function preset(_, options = {}) {
  const PRODUCTION = process.env.NODE_ENV === "production"

  return {
    presets: [
      [
        r("babel-preset-env"),
        {
          loose: true,
          debug: !!options.debug,
          modules: "commonjs",
          useBuiltIns: true,
          targets: {
            node: PRODUCTION ? 4.0 : "current",
            uglify: PRODUCTION ? true : false,
          },
        },
      ],
      r("babel-preset-react"),
      r("babel-preset-flow"),
    ],
    plugins: [
      r("babel-plugin-transform-object-rest-spread"),
      [
        r("babel-plugin-transform-runtime"),
        {
          polyfill: false,
        },
      ],
      r(`babel-plugin-transform-flow-strip-types`),
    ],
  }
}

module.exports = preset
