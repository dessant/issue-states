A GitHub App that opens or closes issues when they are moved to a project column.

![](https://raw.githubusercontent.com/dessant/issue-states/master/assets/screenshot.png)

## Usage

1. **[Install the GitHub App](https://github.com/apps/issue-states)** for the intended repositories
2. Start adding or moving issues to the project columns defined in `openIssueColumns` and `closedIssueColumns`

Issues which were already in the respective columns before the app was installed will not be processed. To process these issues, move them to a different column, then move them back.

Care must be taken during the use of the app to not conflict with project automation presets on GitHub.

⚠️ **If possible, install the app only for select repositories. Do not leave the `All repositories` option selected, unless you intend to use the app for all current and future repositories.**

#### Configuration

Optionally, create `.github/issue-states.yml` in the default branch of the repository or add it at the same file path to a special repository named `.github` to override any of these default settings:

```yaml
# Configuration for Issue States - https://github.com/dessant/issue-states

# Open issues that are moved to these project columns. Set to `[]` to disable
openIssueColumns: []

# Close issues that are moved to these project columns. Set to `[]` to disable
closedIssueColumns:
  - Closed
  - Done

# Repository to extend settings from
# _extends: repo
```

## Supporting the Project

The continued development of Issue States is made possible thanks to the support of awesome backers. If you'd like to join them, please consider contributing with [Patreon](https://www.patreon.com/dessant), [PayPal](https://www.paypal.me/ArminSebastian) or [Bitcoin](https://goo.gl/uJUAaU).
