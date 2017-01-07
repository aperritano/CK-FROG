import { Mongo } from 'meteor/mongo';
import { uuid } from 'frog-utils';
import { operator_types_obj } from '../operator_types';
import { Graphs, addGraph } from './graphs';

export const Activities = new Mongo.Collection('activities');
export const Operators = new Mongo.Collection('operators');
export const Results = new Mongo.Collection('results');

export const addActivity = (activity_type, data, id) => {
  if(id) {
    Activities.update(id, {$set: {data: data}})
  } else {
    Activities.insert({
      _id: uuid(),
      activity_type: activity_type,
      data: data,
      created_at: new Date(),
    })
  }
}

export const duplicateActivity = (activity) =>
  Activities.insert({...activity, _id: uuid(), data: {...activity.data, name: activity.data.name + ' (copy)'}})

export const addGraphActivity = (params, id = uuid()) =>
  Activities.insert({ ...params, graphId: params.graphId, created_at: new Date(), _id: id})

export const addSessionActivity = (params) => {
  const id = uuid()
  Activities.insert({ ...params, sessionId: params.sessionId, created_at: new Date(), _id: id })
  return(id)
}

export const updateGraphActivityDuration = (activityId, duration) => {
  Activities.update({_id: activityId}, {$set: {"data.duration": duration}})
}

export const removeGraphActivity = (activityId) =>
  Meteor.call('graph.flush.activity', activityId)

export const addGraphOperator = (params) =>
  Operators.insert({ ...params, graphId: params.graphId, created_at: new Date(), _id: uuid() })

export const modifyGraphOperator = (operatorId, opType, type, data) =>
  Operators.update(operatorId, {$set: {operator_type: opType, type: type, data: data}})

export const addSessionOperator = (params) =>
  Operators.insert({ ...params, sessionId: params.sessionId, created_at: new Date(), _id: uuid() })

export const copyActivityIntoGraphActivity = (graphActivityId, fromActivityId) => {
  const fromActivity = Activities.findOne({_id:fromActivityId})
  Activities.update(graphActivityId, {$set: {data: fromActivity.data, activity_type: fromActivity.activity_type, parent_id: fromActivityId}})
}

export const copyOperatorIntoGraphOperator = (graphOperatorId, fromOperatorId) => {
  const fromOperator = Operators.findOne({_id:fromOperatorId})
  Operators.update(graphOperatorId, {$set: {data: fromOperator.data, operator_type: fromOperator.operator_type, type:fromOperator.type}})
}

export const dragGraphActivity = ( id, position ) => {
  Activities.update({_id: id}, {$set: {position: position}})
}

export const removeGraphOperator = (id, graphId) => {
  Operators.remove({_id: id}, {graphId: graphId})
}
export const addOperator = (operator_type, data, id) => {
  if(id) {
    Operators.update(id, {$set: {data: data}})
  } else {
    Operators.insert({
      _id: uuid(),
      operator_type: operator_type,
      type: operator_types_obj[operator_type].meta.type,
      data: data,
      created_at: new Date() })
  }
}

export const addResult = (type, activity_id, result) => {
  Results.update(activity_id + ":" + type, {$set: {type: type, activity_id: activity_id, result: result, created_at: new Date()}}, {upsert: true})
}

export const duplicateGraph = (graphId) => {
  let activities = Activities.find({graphId: graphId}).fetch()
  let oldActivitiesId = activities.map((activity) => activity._id)
  const newActivitiesId = oldActivitiesId.map((id) => uuid())
  let operators = Operators.find({graphId: graphId}).fetch()
  let newGraphId = addGraph()
  console.log(JSON.stringify(newActivitiesId, null, 2))
  operators.forEach((operator) => {
    let fromIndex = oldActivitiesId.indexOf(operator.from._id)
    let toIndex = oldActivitiesId.indexOf(operator.to._id)
    const fromObject = {plane: activities[fromIndex].plane, _id: newActivitiesId[fromIndex]}
    const toObject = {plane: activities[toIndex].plane, _id:newActivitiesId[toIndex]}

    console.log("from " + fromObject._id + " to " + toObject._id)
    addGraphOperator({_id: uuid(), graphId: newGraphId, from: fromObject, to: toObject})
  })
  activities.forEach((activity, i) => {
    let newActivity = _.clone(activity, true)
    newActivity._id = newActivitiesId[i]
    newActivity.graphId = newGraphId
    console.log("newId " + newActivity._id)
    addGraphActivity(newActivity, newActivity._id)
  })
  return newGraphId
}

export const flushActivities = () =>
  Meteor.call('activities.flush')

Meteor.methods({
  'activities.flush'() {
    Activities.remove({})
  },

  'graph.flush.all'(graphId){
    Graphs.remove({ _id: graphId })
    Activities.remove({ graphId: graphId })
    Operators.remove({ graphId: graphId })
  },

  'graph.flush.activity'(activityId){
    Operators.remove({ from: activityId })
    Operators.remove({ to: activityId })
    Activities.remove({ _id: activityId })
  }
})
