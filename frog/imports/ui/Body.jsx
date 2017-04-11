// @flow
import React from 'react';
import { Meteor } from 'meteor/meteor';

import Home from './Home';
import StudentView from './StudentView';
import TeacherView from './TeacherView';
import GraphEditor from './GraphEditor';
import Admin from './Admin';

const Body = ({ userId, app }) => {
  if (userId) {
    switch (app) {
      case 'Home':
        return <Home />;
      case 'Admin':
        return <Admin />;
      case 'Graph Editor':
        return <GraphEditor />;
      case 'Student View':
        return <StudentView />;
      case 'Teacher View':
        return <TeacherView />;
      default:
        return <p>MISSING OR WRONG STATE IN APP COMPONENT: {app}</p>;
    }
  }
  return <p>NOT LOGGED IN. PLEASE SIGN IN OR SIGN UP.</p>;
};

export default createContainer(() => ({ userId: Meteor.userId() }), Body);
