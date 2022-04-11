#!/usr/bin/env bash
# This script downloads the asset files this plugin needs from the 
# repository: https://github.com/aws-samples/amazon-sumerian-hosts
# It assumes it is being run from the root of the package.

if ! git --version 2>&1 >/dev/null
then
    echo "Git is not available; please check that it is installed"
    exit 1
fi

# skip if /assets already exists
if [ -d "./assets" ]
then
    echo "Assets have already been downloaded"
    exit 0
fi

# Clone repo with no history, no file content, and of only the topmost directory
# This is essentially the 'smallest' clone we can do 
git clone --depth 1 \
  --filter=blob:none  \
  --sparse \
  https://github.com/aws-samples/amazon-sumerian-hosts 

## Check out files matching this pattern -- in this case we're filtering by directory
echo "Now downloading asset files -- this can take up to ten minutes"
cd amazon-sumerian-hosts
git sparse-checkout set d1 examples/assets

## Clean up
cd ..
mv amazon-sumerian-hosts/examples/assets ./
rm -rf amazon-sumerian-hosts/