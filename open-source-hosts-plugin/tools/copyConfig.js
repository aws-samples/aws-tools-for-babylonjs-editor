// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0
// eslint-disable-next-line @typescript-eslint/no-var-requires
const fs = require('fs-extra');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

const srcDir = path.join(__dirname, '..', 'config');

const destDir = path.join(__dirname, '..', 'build/config');
if (!fs.existsSync(destDir)) {
  fs.mkdirSync(destDir, {recursive: true});
}

fs.copySync(srcDir, destDir);
