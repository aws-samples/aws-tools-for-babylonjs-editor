# Contributing Guidelines and Workflow

Thank you for your interest in contributing to our project. This document covers specifically on how to build and test the open-source-hosts-plugin package. Please refer to the main [CONTRIBUTING](../CONTRIBUTING) document for a detailed explanation on how to contribute to the repository. 

---

## [Contributor Workflow](#contributor-workflow)

### Prerequisites

- Refer to all [prerequisites](../CONTRIBUTING#contributor-workflow#prerequisites) from the primary repository

### Building

1. Because we rely on packages that have not yet been published to the NPM registry, you will need to run `git clone` on `mainline2.0` of the [Amazon Sumerian Hosts](https://github.com/aws-samples/amazon-sumerian-hosts/tree/mainline2.0) repository to pull it somewhere local. From that repository, run `npm run build` and then cd into the `packages/amazon-sumerian-hosts-babylon` directory and run `npm link` to make the submodule available locally.
1. Install the other plugin dependencies defined in `package.json`:  
   `npm install`  
   **Note that this will download the required asset files as a script run during post-install -- this may take a while!**
1. From the plugin directory, run `npm link @amazon-sumerian-hosts/babylon`
1. Format, lint, and compile the Typescript code into Javascript
   `npm run build`

### Testing

#### Unit Tests

You can run the unit test suite by using the command: `npm run test`

Unit tests will be run automatically across Windows/Linux/MacOSX on every submitted PR.

#### Integration Tests

Manually ensure that the plugin loads in the editor, and that a host can be added to the open project without errors.
