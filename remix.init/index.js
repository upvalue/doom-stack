const { execSync } = require("child_process");
const crypto = require("crypto");
const fs = require("fs/promises");
const path = require("path");

const toml = require("@iarna/toml");
const PackageJson = require("@npmcli/package-json");
const semver = require("semver");
const YAML = require("yaml");

const escapeRegExp = (string) =>
  // $& means the whole matched string
  string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const getPackageManagerCommand = (packageManager) => // Inspired by https://github.com/nrwl/nx/blob/bd9b33eaef0393d01f747ea9a2ac5d2ca1fb87c6/packages/nx/src/utils/package-manager.ts#L38-L103
({
  npm: () => ({
    exec: "npx",
    lockfile: "package-lock.json",
    run: (script, args) => `npm run ${script} ${args ? `-- ${args}` : ""}`,
  }),
  pnpm: () => {
    const pnpmVersion = getPackageManagerVersion("pnpm");
    const includeDoubleDashBeforeArgs = semver.lt(pnpmVersion, "7.0.0");
    const useExec = semver.gte(pnpmVersion, "6.13.0");

    return {
      exec: useExec ? "pnpm exec" : "pnpx",
      lockfile: "pnpm-lock.yaml",
      run: (script, args) =>
        includeDoubleDashBeforeArgs
          ? `pnpm run ${script} ${args ? `-- ${args}` : ""}`
          : `pnpm run ${script} ${args || ""}`,
    };
  },
  yarn: () => ({
    exec: "yarn",
    lockfile: "yarn.lock",
    run: (script, args) => `yarn ${script} ${args || ""}`,
  }),
}[packageManager]());

const getPackageManagerVersion = (packageManager) =>
  // Copied over from https://github.com/nrwl/nx/blob/bd9b33eaef0393d01f747ea9a2ac5d2ca1fb87c6/packages/nx/src/utils/package-manager.ts#L105-L114
  execSync(`${packageManager} --version`).toString("utf-8").trim();

const getRandomString = (length) => crypto.randomBytes(length).toString("hex");

const readFileIfNotTypeScript = (
  isTypeScript,
  filePath,
  parseFunction = (result) => result,
) =>
  isTypeScript
    ? Promise.resolve()
    : fs.readFile(filePath, "utf-8").then(parseFunction);

const removeUnusedDependencies = (dependencies, unusedDependencies) =>
  Object.fromEntries(
    Object.entries(dependencies).filter(
      ([key]) => !unusedDependencies.includes(key),
    ),
  );

const updatePackageJson = ({ APP_NAME, isTypeScript, packageJson }) => {
  const {
    devDependencies,
    prisma: { seed: prismaSeed, ...prisma },
    scripts: {
      "format:repo": _repoFormatScript,
      "lint:repo": _repoLintScript,
      typecheck,
      validate,
      ...scripts
    },
  } = packageJson.content;

  packageJson.update({
    name: APP_NAME,
    devDependencies: removeUnusedDependencies(
      devDependencies,
      // packages that are only used for linting the repo
      ["eslint-plugin-markdown", "eslint-plugin-prefer-let"].concat(
        isTypeScript ? [] : ["ts-node"],
      ),
    ),
    prisma: isTypeScript
      ? { ...prisma, seed: prismaSeed }
      : {
        ...prisma,
        seed: prismaSeed
          .replace("ts-node", "node")
          .replace("seed.ts", "seed.js"),
      },
    scripts: isTypeScript
      ? { ...scripts, typecheck, validate }
      : { ...scripts, validate: validate.replace(" typecheck", "") },
  });
};

const main = async ({ isTypeScript, packageManager, rootDirectory }) => {
  const pm = "pnpm";
  const FILE_EXTENSION = isTypeScript ? "ts" : "js";

  const README_PATH = path.join(rootDirectory, "README.md");

  const REPLACER = "doom-stack-template";

  const DIR_NAME = path.basename(rootDirectory);
  const SUFFIX = getRandomString(2);

  const APP_NAME = (DIR_NAME + "-" + SUFFIX)
    // get rid of anything that's not allowed in an app name
    .replace(/[^a-zA-Z0-9-_]/g, "-");

  const [
    prodContent,
    readme,
    packageJson,
  ] = await Promise.all([
    fs.readFile(README_PATH, "utf-8"),
    PackageJson.load(rootDirectory),
  ]);

  const initInstructions = `
- First run this stack's \`remix.init\` script and commit the changes it makes to your project.

  \`\`\`sh
  npx remix init
  git init # if you haven't already
  git add .
  git commit -m "Initialize project"
  \`\`\`
`;

  const newReadme = readme
    .replace(new RegExp(escapeRegExp(REPLACER), "g"), APP_NAME)
    .replace(initInstructions, "");

  updatePackageJson({ APP_NAME, isTypeScript, packageJson });

  const fileOperationPromises = [
    fs.writeFile(README_PATH, newReadme),
    packageJson.save(),
    fs.copyFile(
      path.join(rootDirectory, "remix.init", "gitignore"),
      path.join(rootDirectory, ".gitignore"),
    ),
    fs.rm(path.join(rootDirectory, ".eslintrc.repo.js")),
    fs.rm(path.join(rootDirectory, "LICENSE.md")),
  ];

  await Promise.all(fileOperationPromises);

  execSync(pm.run("format", "--loglevel warn"), {
    cwd: rootDirectory,
    stdio: "inherit",
  });

  console.log(
    `
Setup is almost complete. Follow these steps to finish initialization:
    `.trim(),
  );
};

module.exports = main;
