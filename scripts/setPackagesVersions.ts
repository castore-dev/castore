import { readdirSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const newVersion = process.argv[2] as string | undefined;

if (newVersion === undefined) {
  throw new Error('Invalid version');
}

const semanticVersioningRegex =
  /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;

const VERSION_MAJOR = (newVersion.match(semanticVersioningRegex) ?? [])[1];

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

  packageJson.version = newVersion;

  Object.keys(packageJson.dependencies ?? {}).forEach(dependencyName => {
    if (dependencyName.startsWith('@castore/')) {
      (packageJson.dependencies as Record<string, string>)[dependencyName] =
        newVersion;
    }
  });

  Object.keys(packageJson.peerDependencies ?? {}).forEach(dependencyName => {
    if (dependencyName.startsWith('@castore/')) {
      (packageJson.peerDependencies as Record<string, string>)[
        dependencyName
      ] = `^${VERSION_MAJOR}.0.0`;
    }
  });

  writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
});
