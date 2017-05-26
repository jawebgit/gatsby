const _ = require(`lodash`)

module.exports = async function onNodeCreate({ node, boundActionCreators }) {
  const { createNode, addNodeToParent } = boundActionCreators

  const extensions = [`jpeg`, `jpg`, `png`, `webp`, `tif`, `tiff`, `svg`]
  if (!_.includes(extensions, node.extension)) {
    return
  }

  const imageNode = {
    id: `${node.id} >> ImageSharp`,
    children: [],
    parent: node.id,
    internal: {
      contentDigest: `${node.internal.contentDigest}`,
      type: `ImageSharp`,
      mediaType: node.internal.mediaType,
    },
  }

  createNode(imageNode)
  addNodeToParent({ parent: node, child: imageNode })

  return
}
