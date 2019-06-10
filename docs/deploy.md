# Deploying

If you would like to run your own instance of this app, see the
[docs for deployment](https://probot.github.io/docs/deployment/).

This app requires these **Permissions & events** for the GitHub App:

- Issues - **Read & Write**
- Organization projects - **Read-only**
- Repository metadata - **Read-only**
- Repository projects - **Read-only**
  - [x] Check the box for **Project card** events
- Single File - **Read-only**
  - Path: `.github/issue-states.yml`
