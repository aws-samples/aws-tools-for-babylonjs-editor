# Contributing Guidelines and Workflow

Thank you for your interest in contributing to our project. This document covers specifically on how to build and test the aws-amplify-publisher-plugin package. Please refer to the main [CONTRIBUTING](../CONTRIBUTING) document for a detailed explanation on how to contribute to the repository. 

---

## [Contributor Workflow](#contributor-workflow)

### Prerequisites

- Refer to all [prerequisites](../CONTRIBUTING#contributor-workflow#prerequisites) from the primary repository

### Building

1. Install the plugin dependencies defined in `package.json`:
   `npm install`
2. Compile the Typescript code into Javascript
   `npm run compile`

### Testing

#### Unit Tests

You can run the unit test suite by using the command: `npm run test`

Unit tests will be run automatically across Windows/Linux/MacOSX on every submitted PR.

#### Integration Tests

Manually ensure that the plugin loads in the editor, and that a host can be added to the open project without errors.
