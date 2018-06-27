# Issue States

[![npm](https://img.shields.io/npm/v/issue-states.svg?style=flat-square&colorB=007EC6)](https://www.npmjs.com/package/issue-states)

Issue States is a GitHub App built with [Probot](https://github.com/probot/probot)
that opens or closes issues when they are moved to a project column.

![](assets/screenshot.png)

## Supporting the Project

The continued development of Issue States is made possible
thanks to the support of awesome backers. If you'd like to join them,
please consider contributing with [Patreon](https://goo.gl/qRhKSW),
[PayPal](https://goo.gl/5FnBaw) or [Bitcoin](https://goo.gl/uJUAaU).

## Usage

1. **[Install the GitHub App](https://github.com/apps/issue-states)**
   for the required repositories
2. Start adding or moving issues to the project columns defined
   in `openIssueColumns` and `closedIssueColumns`

Issues which were already in the respective columns before the app was installed
will not be processed. To process these issues, move them to a different column,
then move them back.

Care must be taken during the use of the app to not conflict with project
automation presets on GitHub.

#### Configuration

Optionally, create `.github/issue-states.yml` in the default branch
of the repository to override any of these default settings:

```yaml
# Configuration for issue-states - https://github.com/dessant/issue-states

# Open issues that are moved to these project columns. Set to `[]` to disable
openIssueColumns: []

# Close issues that are moved to these project columns. Set to `[]` to disable
closedIssueColumns:
  - Closed
  - Done

# Repository to extend settings from
# _extends: repo
```

## Deployment

See [docs/deploy.md](docs/deploy.md) if you would like to run your own
instance of this app.

## License

Issue States is released under the terms of the MIT License.
Please refer to the [LICENSE](LICENSE) file.
