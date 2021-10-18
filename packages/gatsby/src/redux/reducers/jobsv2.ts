import {
  ICreateJobV2Action,
  IRemoveStaleJobV2Action,
  IEndJobV2Action,
  IGatsbyState,
  IGatsbyIncompleteJobV2,
  IGatsbyCompleteJobV2,
  IDeleteCacheAction,
  ISetJobV2Context,
  IClearJobV2Context,
} from "../types"

const initialState = (): IGatsbyState["jobsV2"] => {
  return {
    incomplete: new Map(),
    complete: new Map(),
    jobsByRequest: new Map(),
  }
}

export const jobsV2Reducer = (
  state = initialState(),
  action:
    | ICreateJobV2Action
    | IRemoveStaleJobV2Action
    | IEndJobV2Action
    | ISetJobV2Context
    | IClearJobV2Context
    | IDeleteCacheAction
): IGatsbyState["jobsV2"] => {
  switch (action.type) {
    case `DELETE_CACHE`:
      return (action as IDeleteCacheAction).cacheIsCorrupt
        ? initialState()
        : state

    case `CREATE_JOB_V2`: {
      const { job } = action.payload

      state.incomplete.set(job.contentDigest, {
        job,
      } as IGatsbyIncompleteJobV2)

      return state
    }

    case `END_JOB_V2`: {
      const { jobContentDigest, result } = action.payload
      const { job } = state.incomplete.get(
        jobContentDigest
      ) as IGatsbyIncompleteJobV2

      if (!job) {
        throw new Error(
          `If you encounter this error, it's probably a Gatsby internal bug. Please open an issue reporting us this.`
        )
      }

      state.incomplete.delete(job.contentDigest)

      // inputPaths is used to make sure the job is not stale
      state.complete.set(job.contentDigest, {
        result,
        inputPaths: job.inputPaths,
      } as IGatsbyCompleteJobV2)

      return state
    }

    case `REMOVE_STALE_JOB_V2`: {
      const { contentDigest } = action.payload
      state.incomplete.delete(contentDigest)
      state.complete.delete(contentDigest)

      return state
    }

    case `SET_JOB_V2_CONTEXT`: {
      const { requestId, job } = action.payload

      // A workaround for a stale cache bug:
      // in some edge case redux cache is not cleared (even after gatsby-config and package.json changes).
      // TODO: figure out the root cause and remove this workaround (see also CLEAR_JOB_V2_CONTEXT)
      if (!state.jobsByRequest) {
        state.jobsByRequest = new Map()
      }
      let jobs = state.jobsByRequest.get(requestId)
      if (!jobs) {
        jobs = new Set<string>()
        state.jobsByRequest.set(requestId, jobs)
      }
      jobs.add(job.contentDigest)

      return state
    }

    case `CLEAR_JOB_V2_CONTEXT`: {
      const { requestId } = action.payload
      if (!state.jobsByRequest) {
        state.jobsByRequest = new Map()
      }
      state.jobsByRequest.delete(requestId)
    }
  }

  return state
}
