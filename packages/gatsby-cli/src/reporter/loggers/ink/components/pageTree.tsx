import React, { ReactElement, useContext } from "react"
import { Box, Text, BoxProps, Spacer } from "ink"
import path from "path"
import StoreStateContext from "../context"
import {
  generatePageTree,
  IPageTreeLine,
  IComponentWithPageModes,
} from "../../../../util/generate-page-tree"

interface IPageTreeProps {
  components: Map<string, IComponentWithPageModes>
  root: string
}

const Description: React.FC<BoxProps> = function Description(props) {
  return (
    <Box>
      <Box
        {...props}
        flexDirection="column"
        borderStyle="round"
        padding={1}
        marginLeft={2}
        marginRight={2}
      >
        <Box paddingLeft={2}>
          <Text>(SSG) Generated at build time</Text>
        </Box>
        <Text>
          D (DSG) Defered static generation - page generated at runtime
        </Text>
        <Text>∞ (SSR) Server-side renders at runtime (uses getServerDate)</Text>
        <Text>λ (Function) Gatsby function</Text>
      </Box>
      <Spacer />
    </Box>
  )
}

const ComponentTree: React.FC<{
  file: string
  isFirst: boolean
  isLast: boolean
  pages: IComponentWithPageModes
}> = function ComponentTree({ file, isFirst, isLast, pages }) {
  let topLevelIcon = `├`
  if (isFirst) {
    topLevelIcon = `┌`
  }
  if (isLast) {
    topLevelIcon = `└`
  }

  const sortedPages: Array<IPageTreeLine> = generatePageTree(pages)

  return (
    <Box flexDirection="column">
      <Box>
        <Box paddingRight={1}>
          <Text>{topLevelIcon}</Text>
        </Box>
        <Text wrap="truncate-middle">{file}</Text>
      </Box>
      {sortedPages.map((page, index) => (
        <Box key={page.text}>
          <Text>{isLast ? ` ` : `│`}</Text>
          <Box paddingLeft={1} paddingRight={1}>
            <Text>{index === sortedPages.length - 1 ? `└` : `├`}</Text>
          </Box>
          <Box>
            <Text>
              {page.symbol} {page.text}
            </Text>
          </Box>
        </Box>
      ))}
    </Box>
  )
}

const PageTree: React.FC<IPageTreeProps> = function PageTree({
  components,
  root,
}) {
  const componentList: Array<ReactElement> = []
  let i = 0
  for (const [componentPath, pages] of components) {
    componentList.push(
      <ComponentTree
        isFirst={i === 0}
        isLast={i === components.size - 1}
        key={componentPath}
        file={path.posix.relative(root, componentPath)}
        pages={pages}
      />
    )

    i++
  }

  return (
    <Box flexDirection="column" marginTop={2}>
      <Box paddingBottom={1}>
        <Text underline>Pages</Text>
      </Box>
      {componentList}
      <Description marginTop={1} marginBottom={1} />
    </Box>
  )
}

const ConnectedPageTree: React.FC = function ConnectedPageTree() {
  const state = useContext(StoreStateContext)

  const componentWithPages = new Map<string, IComponentWithPageModes>()
  for (const { componentPath, pages } of state.components.values()) {
    const pagesByMode = {
      SSG: new Set<string>(),
      DSG: new Set<string>(),
      SSR: new Set<string>(),
      FN: new Set<string>(),
    }
    pages.forEach(pagePath => {
      const gatsbyPage = state.pages.get(pagePath)
      // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
      pagesByMode[gatsbyPage!.mode].add(pagePath)
    })

    componentWithPages.set(componentPath, pagesByMode)
  }

  for (const {
    originalAbsoluteFilePath,
    functionRoute,
  } of state.functions.values()) {
    componentWithPages.set(originalAbsoluteFilePath, {
      SSG: new Set<string>(),
      DSG: new Set<string>(),
      SSR: new Set<string>(),
      FN: new Set<string>([`/api/${functionRoute}`]),
    })
  }

  return (
    <PageTree components={componentWithPages} root={state.program.directory} />
  )
}

export default ConnectedPageTree
