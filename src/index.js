const uuidV4 = require('uuid/v4');
const sendMessage = require('probot-messages');

const schema = require('./schema');

module.exports = async robot => {
  const github = await robot.auth();
  const appName = (await github.apps.getAuthenticated()).data.name;

  robot.on(
    ['project_card.created', 'project_card.converted', 'project_card.moved'],
    async context => {
      const logger = context.log.child({appName, session: uuidV4()});
      await processCard(context, logger);
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

  async function processCard(context, log) {
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
    const [owner, repo, issue_number] = match.slice(1);
    const issue = {owner, repo, issue_number};
    const config = await getConfig(context, log, {owner, repo});
    if (!config) {
      return;
    }
    const {openIssueColumns, closedIssueColumns, perform} = config;

    const {data: columnData} = await github.projects.getColumn({
      column_id: payload.project_card.column_id
    });
    const columnName = columnData.name;
    let newState;
    if (openIssueColumns.includes(columnName)) {
      newState = 'open';
    }
    if (closedIssueColumns.includes(columnName)) {
      newState = 'closed';
    }
    if (!newState) {
      return;
    }

    const {data: issueData} = await github.issues.get(issue);
    if (issueData.state === newState || issueData.pull_request) {
      return;
    }

    log.info(
      {issue, cardId, perform},
      newState === 'open' ? 'Opening issue' : 'Closing issue'
    );
    if (perform) {
      await github.issues.update({...issue, state: newState});
    }

    storeCard(cardId);
  }

  async function getConfig(context, log, repo, file = 'issue-states.yml') {
    let config;
    try {
      // Organization level project card events are not associated with a repo
      context.repo = params => Object.assign({}, repo, params);
      const repoConfig = await context.config(file);
      const {error, value} = schema.validate(repoConfig || {});
      if (error) {
        throw error;
      }
      config = value;
    } catch (err) {
      log.warn({err: new Error(err), repo, file}, 'Invalid config');
      if (['YAMLException', 'ValidationError'].includes(err.name)) {
        await sendMessage(
          robot,
          context,
          '[{appName}] Configuration error',
          '[{appName}]({appUrl}) has encountered a configuration error in ' +
            `\`${file}\`.\n\`\`\`\n${err.toString()}\n\`\`\``,
          {update: 'The configuration error is still occurring.', ...repo}
        );
      }
    }

    return config;
  }
};
