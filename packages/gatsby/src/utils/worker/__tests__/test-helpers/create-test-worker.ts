import { WorkerPool } from "gatsby-worker"

export type GatsbyTestWorkerPool = WorkerPool<
  typeof import("./child-for-tests")
>

export function createTestWorker(): GatsbyTestWorkerPool {
  const worker = new WorkerPool<typeof import("./child-for-tests")>(
    require.resolve(`./child-for-tests`),
    {
      numWorkers: 1,
      env: {
        // We are using JEST_WORKER_ID env so that worker use same test database as
        // jest runner process
        FORCE_TEST_DATABASE_ID: process.env.JEST_WORKER_ID,
        GATSBY_WORKER_POOL_WORKER: `true`,
        NODE_OPTIONS: `--require ${require.resolve(`./ts-register`)}`,
      },
    }
  ) as GatsbyTestWorkerPool

  return worker
}
