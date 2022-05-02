// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {spawnSync} = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {existsSync, copySync, rmSync, ensureDirSync} = require('fs-extra');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require('process');

// check whether git exists. If not, throw the error and ask customers to install it.
const {stdout, error} = spawnSync('git', ['--version']);
if (error) {
  console.error(
    `${error} Please check that Git is installed and set as the environment variable.`
  );
  process.exit(1);
}
console.log(stdout.toString('utf8'));

const assetsDir = path.join(__dirname, '../assets');

// check whether Assets folder exists.
if (existsSync(assetsDir)) {
  console.log('Assets have already been downloaded');
  process.exit(0);
}

// Clone repo with no history, no file content, and of only the topmost directory
// This is essentially the 'smallest' clone we can do 
console.log('Now downloading asset files -- this can take up to ten minutes');
spawnSync(
  'git',
  [
    'clone',
    '--depth',
    '1',
    '--filter=blob:none',
    '--sparse',
    'https://github.com/aws-samples/amazon-sumerian-hosts',
  ],
  {stdio: ['ignore', 'inherit', 'inherit']}
);

const hostDir = path.join(__dirname, '../amazon-sumerian-hosts');
process.chdir(hostDir);

// Check out files matching this pattern -- in this case we're filtering by directory
spawnSync('git', ['sparse-checkout', 'set', 'd1', 'packages/demos-babylon/src/character-assets'], {
  stdio: ['ignore', 'inherit', 'inherit'],
});

process.chdir('../');

// We want our asset files to be nested under /gLTF
const gLTFDir = path.join(assetsDir, 'gLTF');
ensureDirSync(gLTFDir);

copySync(
  path.join(process.cwd(), 'amazon-sumerian-hosts/packages/demos-babylon/src/character-assets'),
  gLTFDir
);

rmSync(hostDir, {recursive: true, force: true});
