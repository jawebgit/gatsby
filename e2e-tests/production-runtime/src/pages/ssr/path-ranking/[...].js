import React from "react"

export default function StaticPath({ serverData }) {
  return (
    <div>
      <h2>Query</h2>
      <pre data-testid="query">{JSON.stringify(serverData?.arg?.query)}</pre>
      <h2>Params</h2>
      <pre data-testid="params">{JSON.stringify(serverData?.arg?.params)}</pre>
      <h2>Debug</h2>
      <pre>{JSON.stringify({ serverData }, null, 2)}</pre>
    </div>
  )
}

export function getServerData(arg) {
  return {
    props: {
      arg,
    },
  }
}
