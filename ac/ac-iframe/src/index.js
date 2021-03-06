// @flow

import * as React from 'react';
import type { ActivityRunnerPropsT } from 'frog-utils';

export const meta = {
  name: 'Embedded website',
  shortDesc: 'Embedding an external website in an iFrame',
  description:
    'Takes a URL and displays the corresponding website embedded in an iFrame. Not all websites allow embedding.',
  exampleData: [
    {
      title: "Stian's blog",
      config: {
        url: 'http://reganmian.net'
      },
      activityData: {}
    }
  ]
};

export const config = {
  type: 'object',
  properties: {
    url: {
      type: 'string',
      title: 'URL of website'
    }
  }
};

export const ActivityRunner = ({ activityData }: ActivityRunnerPropsT) => (
  <iframe
    title="IFrame"
    src={activityData.config.url}
    style={{ width: '100%', height: '100%', overflow: 'auto' }}
  />
);

export default {
  id: 'ac-iframe',
  type: 'react-component',
  ActivityRunner,
  config,
  meta
};
