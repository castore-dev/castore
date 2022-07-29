import { readdirSync, readFileSync } from 'fs';
import { join } from 'path';

const newVersionTag = process.argv[2] as string | undefined;

console.log('newVersionTag', newVersionTag);

const semanticVersioningRegex =
  /^v(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

if (
  newVersionTag === undefined ||
  !semanticVersioningRegex.test(newVersionTag)
) {
  throw new Error('Invalid version');
}

const NEW_VERSION = newVersionTag.slice(1);
console.log('NEW_VERSION', NEW_VERSION);

const VERSION_MAJOR = (newVersionTag.match(semanticVersioningRegex) ?? [])[1];
console.log('VERSION_MAJOR', VERSION_MAJOR);

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

  Object.keys(packageJson.dependencies ?? {}).forEach(dependencyName => {
    if (dependencyName.startsWith('@castore/')) {
      (packageJson.dependencies as Record<string, string>)[dependencyName] =
        NEW_VERSION;
    }
  });

  Object.keys(packageJson.peerDependencies ?? {}).forEach(dependencyName => {
    if (dependencyName.startsWith('@castore/')) {
      (packageJson.peerDependencies as Record<string, string>)[
        dependencyName
      ] = `^${VERSION_MAJOR}.0.0`;
    }
  });

  // writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
});
