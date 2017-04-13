const {
  GraphQLObjectType,
  GraphQLBoolean,
  GraphQLString,
  GraphQLInt,
  GraphQLFloat,
} = require("graphql")
const {
  queueImageResizing,
  base64,
  responsiveSizes,
  responsiveResolution,
} = require("gatsby-plugin-sharp")

exports.extendNodeType = ({
  type,
  linkPrefix,
  getNodeAndSavePathDependency,
}) => {
  if (type.name !== `ImageSharp`) {
    return {}
  }

  return {
    responsiveResolution: {
      type: new GraphQLObjectType({
        name: `ImageSharpResponsiveResolution`,
        fields: {
          base64: { type: GraphQLString },
          aspectRatio: { type: GraphQLFloat },
          width: { type: GraphQLFloat },
          height: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
        },
      }),
      args: {
        width: {
          type: GraphQLInt,
          defaultValue: 400,
        },
        height: {
          type: GraphQLInt,
        },
        grayscale: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
        quality: {
          type: GraphQLInt,
          defaultValue: 50,
        },
      },
      resolve(image, fieldArgs, context) {
        const promise = responsiveResolution({
          file: getNodeAndSavePathDependency(image.parent, context.path),
          args: { ...fieldArgs, linkPrefix },
        })
        return promise
      },
    },
    responsiveSizes: {
      type: new GraphQLObjectType({
        name: `ImageSharpResponsiveSizes`,
        fields: {
          base64: { type: GraphQLString },
          aspectRatio: { type: GraphQLFloat },
          src: { type: GraphQLString },
          srcSet: { type: GraphQLString },
        },
      }),
      args: {
        maxWidth: {
          type: GraphQLInt,
          defaultValue: 800,
        },
        maxHeight: {
          type: GraphQLInt,
        },
        grayscale: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
        quality: {
          type: GraphQLInt,
          defaultValue: 50,
        },
      },
      resolve(image, fieldArgs, context) {
        return responsiveSizes({
          file: getNodeAndSavePathDependency(image.parent, context.path),
          args: { ...fieldArgs, linkPrefix },
        })
      },
    },
    resize: {
      type: new GraphQLObjectType({
        name: `ImageSharpResize`,
        fields: {
          src: { type: GraphQLString },
          width: { type: GraphQLInt },
          height: { type: GraphQLInt },
          aspectRatio: { type: GraphQLFloat },
        },
      }),
      args: {
        width: {
          type: GraphQLInt,
          defaultValue: 400,
        },
        height: {
          type: GraphQLInt,
        },
        quality: {
          type: GraphQLInt,
          defaultValue: 50,
        },
        jpegProgressive: {
          type: GraphQLBoolean,
          defaultValue: true,
        },
        pngCompressionLevel: {
          type: GraphQLInt,
          defaultValue: 9,
        },
        grayscale: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
        base64: {
          type: GraphQLBoolean,
          defaultValue: false,
        },
      },
      resolve(image, fieldArgs, context) {
        return new Promise(resolve => {
          const file = getNodeAndSavePathDependency(image.parent, context.path)
          if (fieldArgs.base64) {
            resolve(
              base64({
                file,
              })
            )
          } else {
            resolve(
              queueImageResizing({
                file,
                args: { ...fieldArgs, linkPrefix },
              })
            )
          }
        })
      },
    },
  }
}
