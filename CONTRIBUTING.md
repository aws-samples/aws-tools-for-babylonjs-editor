# Contributing Guidelines and Workflow

Thank you for your interest in contributing to our project. Whether it's a bug report, new feature, correction, or additional documentation, we greatly value feedback and contributions from our community.

Please read through this document before editing the code base, submitting any issues, or submitting pull requests to ensure we have all the necessary information to effectively respond to your bug report or contribution.

**In this document:**

- [Contributor Guidelines](#contributor-guidelines)
- [Contributor Workflow](#contributor-workflow)
- [Maintainer Workflow](#maintainer-workflow)

---

## [Contributor Guidelines](#contributor-guidelines)

### Reporting Bugs or Feature Requests

We welcome you to use the GitHub issue tracker to report bugs or suggest features.

When filing an issue, please check existing open, or recently closed, issues to make sure somebody else hasn't already reported the issue. Please try to include as much information as you can. Details like these are incredibly useful:

- A reproducible test case or series of steps
- The version of our code being used
- Any modifications you've made relevant to the bug
- Anything unusual about your environment or deployment

### Reporting Security Issues

If you discover a potential security issue in this project we ask that you notify AWS/Amazon Security via our [vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/). Please do **not** create a public GitHub issue.

### Finding Contributions to Work On

Looking at the existing issues is a great way to find something to contribute on. As our projects, by default, use the default GitHub issue labels (enhancement/bug/duplicate/help wanted/invalid/question/wontfix), looking at any 'help wanted' issues is a great place to start.

### Code of Conduct

This project has adopted the [Amazon Open Source Code of Conduct](https://aws.github.io/code-of-conduct). For more information see the [Code of Conduct FAQ](https://aws.github.io/code-of-conduct-faq) or contact opensource-codeofconduct@amazon.com with any additional questions or comments.

### Licensing

See the [LICENSE](LICENSE) file for our project's licensing. We will ask you to confirm the licensing of your contribution.

We may ask you to sign a [Contributor License Agreement (CLA)](http://en.wikipedia.org/wiki/Contributor_License_Agreement) for larger changes.

---

## [Contributor Workflow](#contributor-workflow)

### Prerequisites

- Read through [CONTRIBUTING](CONTRIBUTING.md)
- Install [Babylon.JS Editor](http://editor.babylonjs.com/)
- Install [Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
  - Git 2.26 or above recommended
- Install [Node.js and npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm)
  - Recommended: Node.js 16 and npm 8.

### Initial Setup

1. Clone the primary repository

```
git clone https://github.com/aws-samples/aws-tools-for-babylonjs-editor.git
```

From here, you will have access to all of the packages that are in the repository.

### Building and Testing

AWS Tools for Babylon.JS Editor is divided into multiple packages, where the root directory does not actually compile or build itself. Refer to the individual folder's CONTRIBUTING for further instructions on how to build and test.

- [AWS Tools: AWS Amplify Publisher Plugin](aws-amplify-publisher-plugin/CONTRIBUTING.md#contributor-workflow)
- [AWS Tools: Open Source Hosts Plugin](open-source-hosts-plugin/CONTRIBUTING.md#contributor-workflow)

### Submitting Pull Requests

Contributions via pull requests are much appreciated. Before sending us a pull request, please ensure that:

1. You are working against the latest source on the _main_ branch.
2. You check existing open and recently merged pull requests to make sure someone else hasn't addressed the problem already.
3. You open an issue to discuss any significant work - we would hate for your time to be wasted.

To send us a pull request, please:

1. Fork the repository.
2. Modify the source; please focus on the specific change you are contributing. If you also reformat all the code, it will be hard for us to focus on your change.
3. Ensure local tests pass.
4. Commit to your fork using clear commit messages.
5. Send us a pull request, answering any default questions in the pull request interface.
6. Pay attention to any automated CI failures reported in the pull request, and stay involved in the conversation.

GitHub provides additional documentation on [forking a repository](https://help.github.com/articles/fork-a-repo/) and [creating a pull request](https://help.github.com/articles/creating-a-pull-request/).

---

## [Maintainer Workflow](#maintainer-workflow)

### Publishing to NPM

All packages are all published and distributed via the [npmjs.com](https://www.npmjs.com/) registry. To publish a new version of the packages to the NPM registry, follow these steps...

1. Update the package.json for each package with new version number using [semantic versioning](https://semver.org/). All packages should always share the same version number.
2. Create a new release using the GitHub.com console. See [previous releases](https://github.com/aws-samples/aws-tools-for-babylonjs-editor/releases) for reference.
   1. In the release creation form, create a new repository tag labeling it using the package version number prefixed with "v". _Example: "v2.1.3"_
   2. Set the target of the release to the `main` branch.
   3. Set the title of the release to match the tag name. _Example: "v2.1.3"_
   4. In the release description field, add a heading in the form **"AWS Tools for Babylon.JS Editor Release _{version number}_ - _{Reason for Release}_"**. Example: _"AWS Tools for Babylon.JS Editor Release 1.3.1 - Bug Fixes"_
   5. Append all significant changes as bullet points.
3. Click "Publish release". This will automatically trigger a GitHub Action that publishes the release to the NPM registry.
4. Validate the GitHub properly releases to NPM through Actions tab.
