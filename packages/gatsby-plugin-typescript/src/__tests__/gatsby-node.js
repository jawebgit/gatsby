jest.mock(`../resolve`, () => module => `/resolved/path/${module}`)

const babelPluginRemoveQueries = require(`babel-plugin-remove-graphql-queries`)
const {
  resolvableExtensions,
  modifyWebpackConfig,
  preprocessSource,
} = require(`../gatsby-node`)

describe(`gatsby-plugin-typescript`, () => {
  let args

  function getLoader() {
    const call = args.boundActionCreators.setWebpackConfig.mock.calls[0]
    return call[0].module.rules[0]
  }

  beforeEach(() => {
    const boundActionCreators = {
      setWebpackConfig: jest.fn(),
    }
    const loaders = { js: jest.fn(() => `babel-loader`) }
    args = { boundActionCreators, loaders }
  })

  it(`returns correct extensions`, () => {
    expect(resolvableExtensions()).toMatchSnapshot()
  })

  it(`modifies webpack config`, () => {
    modifyWebpackConfig(args, { compilerOptions: {} })

    expect(args.boundActionCreators.setWebpackConfig).toHaveBeenCalledTimes(1)
    const lastCall = args.boundActionCreators.setWebpackConfig.mock.calls.pop()
    expect(lastCall).toMatchSnapshot()
  })

  it(`adds the remove graphql queries plugin`, () => {
    modifyWebpackConfig(args, { compilerOptions: {} })

    expect(args.loaders.js).toHaveBeenCalledTimes(1)
    const lastCall = args.loaders.js.mock.calls.pop()

    expect(lastCall[0]).toEqual({
      plugins: [babelPluginRemoveQueries],
    })
  })

  it(`passes the configuration to the ts-loader plugin`, () => {
    const options = { compilerOptions: { foo: `bar` }, transpileOnly: false }

    modifyWebpackConfig(args, options)

    const expectedOptions = {
      compilerOptions: {
        target: `esnext`,
        experimentalDecorators: true,
        jsx: `react`,
        foo: `bar`,
        module: `es6`,
      },
      transpileOnly: false,
    }

    expect(getLoader()).toEqual({
      test: /\.tsx?$/,
      use: [
        `babel-loader`,
        {
          loader: `/resolved/path/ts-loader`,
          options: expectedOptions,
        },
      ],
    })
  })

  it(`uses default configuration for the ts-loader plugin when no config is provided`, () => {
    modifyWebpackConfig(args, { compilerOptions: {} })

    const expectedOptions = {
      compilerOptions: {
        target: `esnext`,
        experimentalDecorators: true,
        jsx: `react`,
        module: `es6`,
      },
      transpileOnly: true,
    }

    expect(getLoader()).toEqual({
      test: /\.tsx?$/,
      use: [
        `babel-loader`,
        {
          loader: `/resolved/path/ts-loader`,
          options: expectedOptions,
        },
      ],
    })
  })

  describe(`pre-processing`, () => {
    const opts = { compilerOptions: {} }
    it(`leaves non-tsx? files alone`, () => {
      expect(
        preprocessSource(
          {
            contents: `alert('hello');`,
            filename: `test.js`,
          },
          opts
        )
      ).toBeNull()
    })

    it(`transforms .ts files`, () => {
      const js = preprocessSource(
        {
          filename: `index.ts`,
          contents: `
          declare let moment: any;

          const now: string = moment().format('HH:MM:ss');
        `,
        },
        opts
      )
      expect(js).not.toBeNull()
      expect(js).toMatchSnapshot()
    })

    it(`transforms JSX files`, () => {
      const js = preprocessSource(
        {
          filename: `tags.ts`,
          contents: `
          import * as React from 'react';

          export default () => <h1>Hello World</h1>;
        `,
        },
        opts
      )

      expect(js).not.toBeNull()
      expect(js).toMatchSnapshot()
    })
  })
})
