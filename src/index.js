const core = require('@actions/core');
const github = require('@actions/github');

const schema = require('./schema');

async function run() {
  try {
    const config = getConfig();
    const client = github.getOctokit(config['github-token']);

    const app = new App(config, client);

    const output = await app.processCard();

    if (output) {
      core.debug('Setting output (issues)');
      core.setOutput('issues', JSON.stringify(output));
    }
  } catch (err) {
    core.setFailed(err);
  }
}

class App {
  constructor(config, client) {
    this.config = config;
    this.client = client;
  }

  async processCard() {
    const payload = github.context.payload;

    if (payload.sender.type === 'Bot') {
      return;
    }

    const contentUrl = payload.project_card.content_url || '';
    const match = contentUrl.match(/\/repos\/(.+)\/(.+)\/issues\/([0-9]+)$/);
    if (!match) {
      return;
    }
    const [owner, repo, issue_number] = match.slice(1);
    const issue = {owner, repo, issue_number};

    const openIssueColumns = this.config['open-issue-columns'];
    const closedIssueColumns = this.config['closed-issue-columns'];

    const {
      data: {name: columnName}
    } = await this.client.rest.projects.getColumn({
      column_id: payload.project_card.column_id
    });

    let newState;
    if (openIssueColumns.includes(columnName)) {
      newState = 'open';
    } else if (closedIssueColumns.includes(columnName)) {
      newState = 'closed';
    }
    if (!newState) {
      return;
    }

    const {data: issueData} = await this.client.rest.issues.get(issue);
    if (issueData.state === newState || issueData.pull_request) {
      return;
    }

    core.debug('Updating issue state');
    await this.client.rest.issues.update({...issue, state: newState});

    return [{...issue, state: newState}];
  }
}

function getConfig() {
  const input = Object.fromEntries(
    Object.keys(schema.describe().keys).map(item => [item, core.getInput(item)])
  );

  const {error, value} = schema.validate(input, {abortEarly: false});
  if (error) {
    throw error;
  }

  return value;
}

run();
