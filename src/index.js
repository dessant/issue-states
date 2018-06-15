const getMergedConfig = require('probot-config');

const schema = require('./schema');

module.exports = robot => {
  robot.on(
    ['project_card.created', 'project_card.converted', 'project_card.moved'],
    async context => {
      await processCard(context);
    }
  );

  const storedCards = [];

  function storeCard(id) {
    storedCards.push(id);
    setTimeout(removeCard, 10000, id);
  }

  function removeCard(id) {
    storedCards.splice(storedCards.indexOf(id), 1);
  }

  function isRecentCard(id) {
    return storedCards.includes(id);
  }

  async function processCard(context) {
    const {payload, github} = context;

    const cardId = payload.project_card.id;
    if (isRecentCard(cardId)) {
      return;
    }

    const contentUrl = payload.project_card.content_url || '';
    const match = contentUrl.match(/\/repos\/(.+)\/(.+)\/issues\/([0-9]+)$/);
    if (!match) {
      return;
    }
    const [owner, repo, issue] = match.slice(1);
    const config = await getConfig(context, {owner, repo});
    if (!config) {
      return;
    }

    const {data: columnData} = await github.projects.getProjectColumn({
      column_id: payload.project_card.column_id
    });
    const columnName = columnData.name;
    let newState;
    if (config.openIssueColumns.includes(columnName)) {
      newState = 'open';
    }
    if (config.closedIssueColumns.includes(columnName)) {
      newState = 'closed';
    }
    if (!newState) {
      return;
    }

    const {data: issueData} = await github.issues.get({
      owner,
      repo,
      number: issue
    });
    if (issueData.state === newState || issueData.pull_request) {
      return;
    }

    robot.log.info(
      {owner, repo, issue},
      newState === 'open' ? 'Opening issue' : 'Closing issue'
    );
    await github.issues.edit({
      owner,
      repo,
      number: issue,
      state: newState
    });

    storeCard(cardId);
  }

  async function getConfig(context, repo) {
    let config;
    try {
      const repoConfig = await getMergedConfig(
        context,
        'issue-states.yml',
        {},
        repo
      );
      const {error, value} = schema.validate(repoConfig || {});
      if (error) {
        throw error;
      }
      config = value;
    } catch (err) {
      robot.log.warn({err: new Error(err), ...repo}, 'Invalid config');
    }

    return config;
  }
};
