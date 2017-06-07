// @flow

import type { ActivityPackageT } from 'frog-utils';

import config from './config';
import ActivityRunner from './ActivityRunner';
import Dashboard from './Dashboard';

const meta = {
  name: 'Brainstorm',
  type: 'react-component'
};

const dataStructure = {
  ideas: {},
  config: {}
};

const mergeFunction = (object, dataFn) => {
  console.log('mergefunction', object);
  console.log(object.product);
  object.product.forEach(list => {
    console.log(list);
    list.product.forEach(x =>
      dataFn.keyedObjInsert({ ...x, score: 0 }, 'ideas')
    );
  });
};

export default ({
  id: 'ac-brainstorm',
  ActivityRunner,
  Dashboard,
  config,
  meta,
  dataStructure,
  mergeFunction
}: ActivityPackageT);
