const Joi = require('joi');

const extendedJoi = Joi.extend({
  type: 'stringList',
  base: Joi.array(),
  coerce: {
    from: 'string',
    method(value) {
      value = value.trim();
      if (value) {
        value = value
          .split(',')
          .map(item => item.trim())
          .filter(Boolean);
      }

      return {value};
    }
  }
});

const schema = Joi.object({
  'github-token': Joi.string().trim().max(100),

  'open-issue-columns': Joi.alternatives()
    .try(
      extendedJoi
        .stringList()
        .items(Joi.string().trim().max(140))
        .min(1)
        .max(30)
        .unique(),
      Joi.string().trim().valid('')
    )
    .default(''),

  'closed-issue-columns': Joi.alternatives()
    .try(
      extendedJoi
        .stringList()
        .items(Joi.string().trim().max(140))
        .min(1)
        .max(30)
        .unique(),
      Joi.string().trim().valid('')
    )
    .default('Closed, Done')
});

module.exports = schema;
