const Joi = require('joi');

const schema = Joi.object().keys({
  openIssueColumns: Joi.array()
    .single()
    .items(Joi.string())
    .default([])
    .description(
      'Open issues that are moved to these project columns. Set to `[]` to disable'
    ),

  closedIssueColumns: Joi.array()
    .single()
    .items(Joi.string())
    .default(['Closed', 'Done'])
    .description(
      'Close issues that are moved to these project columns. Set to `[]` to disable'
    ),

  _extends: Joi.string().description('Repository to extend settings from'),

  perform: Joi.boolean().default(!process.env.DRY_RUN)
});

module.exports = schema;
