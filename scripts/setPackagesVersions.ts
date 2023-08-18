import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const newVersionTag = process.argv[2];

const semanticVersioningRegex =
  /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

if (
  newVersionTag === undefined ||
  !semanticVersioningRegex.test(newVersionTag)
) {
  throw new Error('Invalid version');
}

const NEW_VERSION = newVersionTag.slice(1);

const [VERSION_MAJOR] = newVersionTag.match(semanticVersioningRegex) as [
  string,
];

type PackageJson = {
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
};

const packagesPath = join(__dirname, '..', 'packages');
const packagesNames = readdirSync(join(__dirname, '..', 'packages'));

packagesNames.forEach(packageName => {
  const packageJsonPath = join(packagesPath, packageName, 'package.json');

  const packageJson = JSON.parse(
    readFileSync(packageJsonPath).toString(),
  ) as PackageJson;

  packageJson.version = NEW_VERSION;

  const dependencies = packageJson.dependencies;
  if (dependencies !== undefined) {
    Object.keys(dependencies).forEach(dependencyName => {
      if (dependencyName.startsWith('@castore/')) {
        dependencies[dependencyName] = NEW_VERSION;
      }
    });
  }

  const peerDependencies = packageJson.peerDependencies;
  if (peerDependencies !== undefined) {
    Object.keys(peerDependencies).forEach(dependencyName => {
      if (dependencyName.startsWith('@castore/')) {
        peerDependencies[dependencyName] = `^${VERSION_MAJOR}.0.0`;
      }
    });
  }

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
});
