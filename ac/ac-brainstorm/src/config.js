// @flow

export default {
  type: 'object',
  properties: {
    groupBy: {
      type: 'string',
      title: 'Grouping by',
      enum: ['role', 'group']
    },
    text: {
      type: 'string',
      title: 'Guidelines'
    }
  }
};
