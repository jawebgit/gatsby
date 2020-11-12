import { execSync } from "child_process"
import execa from "execa"
import fs from "fs-extra"
import path from "path"
import { updateSiteMetadata } from "gatsby-core-utils"
import { reporter } from "./reporter"
import { getConfigStore } from "gatsby-core-utils"
import filterStream from "stream-filter"
import { spin } from "./components/spin"
type PackageManager = "yarn" | "npm"

const packageMangerConfigKey = `cli.packageManager`

export const getPackageManager = (): PackageManager =>
  getConfigStore().get(packageMangerConfigKey)

export const setPackageManager = (packageManager: PackageManager): void => {
  getConfigStore().set(packageMangerConfigKey, packageManager)
}

const spawnWithArgs = (
  file: string,
  args: Array<string>,
  options?: execa.Options
): execa.ExecaChildProcess =>
  execa(file, args, { stdio: `inherit`, preferLocal: false, ...options })

const spawn = (
  cmd: string,
  options?: execa.Options
): execa.ExecaChildProcess => {
  const [file, ...args] = cmd.split(/\s+/)
  return spawnWithArgs(file, args, options)
}
// Checks the existence of yarn package
// We use yarnpkg instead of yarn to avoid conflict with Hadoop yarn
// Refer to https://github.com/yarnpkg/yarn/issues/673
const checkForYarn = (): boolean => {
  try {
    execSync(`yarnpkg --version`, { stdio: `ignore` })
    return true
  } catch (e) {
    return false
  }
}

// Initialize newly cloned directory as a git repo
const gitInit = async (
  rootPath: string
): Promise<execa.ExecaReturnBase<string>> => {
  reporter.info(`Initialising git in ${rootPath}`)

  return await spawn(`git init`, { cwd: rootPath })
}

// Create a .gitignore file if it is missing in the new directory
const maybeCreateGitIgnore = async (rootPath: string): Promise<void> => {
  if (fs.existsSync(path.join(rootPath, `.gitignore`))) {
    return
  }

  reporter.info(`Creating minimal .gitignore in ${rootPath}`)
  await fs.writeFile(
    path.join(rootPath, `.gitignore`),
    `.cache\nnode_modules\npublic\n`
  )
}

// Create an initial git commit in the new directory
const createInitialGitCommit = async (rootPath: string): Promise<void> => {
  reporter.info(`Create initial git commit in ${rootPath}`)

  await spawn(`git add -A`, { cwd: rootPath })
  // use execSync instead of spawn to handle git clients using
  // pgp signatures (with password)
  try {
    execSync(`git commit -m "Initial commit from gatsby"`, {
      cwd: rootPath,
    })
  } catch {
    // Remove git support if initial commit fails
    reporter.info(`Initial git commit failed - removing git support\n`)
    fs.removeSync(path.join(rootPath, `.git`))
  }
}

const filter = (pattern: string): NodeJS.ReadWriteStream =>
  filterStream((data: string): boolean => !data.toString().startsWith(pattern))

// Executes `npm install` or `yarn install` in rootPath.
const install = async (
  rootPath: string,
  packages: Array<string>
): Promise<void> => {
  const prevDir = process.cwd()

  let stop = spin(`Installing packages...`)

  process.chdir(rootPath)

  const npmConfigUserAgent = process.env.npm_config_user_agent

  const silent = `--silent`

  try {
    if (!getPackageManager()) {
      if (npmConfigUserAgent?.includes(`yarn`)) {
        setPackageManager(`yarn`)
      } else {
        setPackageManager(`npm`)
      }
    }
    if (getPackageManager() === `yarn` && checkForYarn()) {
      if (await fs.pathExists(`package-lock.json`)) {
        if (!(await fs.pathExists(`yarn.lock`))) {
          await spawn(`yarnpkg import`)
        }
        await fs.remove(`package-lock.json`)
      }

      const args = packages.length ? [`add`, silent, ...packages] : [silent]

      const childProcess = spawnWithArgs(`yarnpkg`, args, {
        all: true,
        stdio: `pipe`,
      })
      // eslint-disable-next-line no-unused-expressions
      childProcess.all?.pipe(filter(`warning`)).pipe(process.stderr)

      await childProcess
    } else {
      await fs.remove(`yarn.lock`)

      let childProcess = spawnWithArgs(`npm`, [`install`, silent], {
        all: true,
        stdio: `pipe`,
      })
      // eslint-disable-next-line no-unused-expressions
      childProcess.all?.pipe(filter(`npm WARN`)).pipe(process.stderr)

      await childProcess

      stop()

      stop = spin(`Installing plugins...`)

      childProcess = spawnWithArgs(`npm`, [`install`, silent, ...packages], {
        all: true,
        stdio: `pipe`,
      })
      // eslint-disable-next-line no-unused-expressions
      childProcess.all?.pipe(filter(`npm WARN`)).pipe(process.stderr)

      await childProcess
    }
  } catch (e) {
    reporter.error(e)
  } finally {
    process.chdir(prevDir)
    stop()
    reporter.success(`Installed packages`)
  }
}

// Clones starter from URI.
const clone = async (
  url: string,
  rootPath: string,
  branch?: string
): Promise<void> => {
  const branchProps = branch ? [`-b`, branch] : []

  const stop = spin(`Cloning site template`)

  const args = [
    `clone`,
    ...branchProps,
    url,
    rootPath,
    `--recursive`,
    `--depth=1`,
    `--quiet`,
  ].filter(arg => Boolean(arg))

  await spawnWithArgs(`git`, args)
  stop()
  reporter.success(`Created site from template`)

  await fs.remove(path.join(rootPath, `.git`))
}

async function gitSetup(rootPath: string): Promise<void> {
  await gitInit(rootPath)
  await maybeCreateGitIgnore(rootPath)
  await createInitialGitCommit(rootPath)
}

/**
 * Main function that clones or copies the starter.
 */
export async function initStarter(
  starter: string,
  rootPath: string,
  packages: Array<string>
): Promise<void> {
  const sitePath = path.resolve(rootPath)

  await clone(starter, sitePath)

  await install(rootPath, packages)

  const sitePackageJson = await fs
    .readJSON(path.join(sitePath, `package.json`))
    .catch(() => {
      reporter.verbose(
        `Could not read "${path.join(sitePath, `package.json`)}"`
      )
    })

  await updateSiteMetadata(
    {
      name: sitePackageJson?.name || rootPath,
      sitePath,
      lastRun: Date.now(),
    },
    false
  )
  await gitSetup(rootPath)
  // trackCli(`NEW_PROJECT_END`);
}
