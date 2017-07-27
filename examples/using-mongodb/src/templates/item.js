import React from "react"
import Link from "gatsby-link"

class Item extends React.Component {
  render() {
    console.log(this.props)
    const story = this.props.data.mongodbCloudDocuments

    return (
      <div>
        <a href={story.url} className="itemlink">
          {story.name}
        </a>
        <p>
          {story.description}
        </p>
      </div>
    )
  }
}

export default Item

export const pageQuery = graphql`
  query ItemQuery($id: String!) {
    mongodbCloudDocuments(id: { eq: $id }) {
      id
      name
      url
      description
    }
  }
`
