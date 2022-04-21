// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {spawnSync} = require('child_process');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {existsSync, copySync, rmSync} = require('fs-extra');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const process = require('process');

// check whether git exists. If not, throw the error and ask customers to install it.
spawnSync('git', ['--version']);

const assetsDir = path.join(__dirname, '../assets');

// check whether Assets folder exists.
if (!existsSync(assetsDir)) {
  console.log('Now downloading asset files -- this can take up to ten minutes');

  spawnSync('git', [
    'clone',
    '--depth',
    '1',
    '--filter=blob:none',
    '--sparse',
    'https://github.com/aws-samples/amazon-sumerian-hosts',
  ]);

  const hostDir = path.join(__dirname, '../amazon-sumerian-hosts');
  process.chdir(hostDir);

  spawnSync('git', ['sparse-checkout', 'set', 'd1', 'examples/assets']);

  process.chdir('../');

  copySync(
    path.join(process.cwd(), 'amazon-sumerian-hosts/examples/assets'),
    assetsDir
  );

  rmSync(hostDir, {recursive: true, force: true});
} else {
  console.log('Assets have already been downloaded');
}
