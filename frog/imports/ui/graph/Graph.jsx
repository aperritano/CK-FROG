import React, { Component, PropTypes } from 'react';
import ReactDOM from 'react-dom';
import DraggableAc from './DraggableAc.jsx';
import Draggable from 'react-draggable';
import { uuid } from 'frog-utils'
import { sortBy, reverse, take } from 'lodash'

import { $ } from 'meteor/jquery'
import ReactTooltip from 'react-tooltip'

//to be put in graph.jxs
const AxisDisplay = ( {getRightMostPosition} ) => {
  return(
  <div>
    <svg width={getRightMostPosition()+"px"} height="200px" xmlns="http://www.w3.org/2000/svg" style={{overflowX: "auto"}}>
      <text x="0%" y="20%" id="plane1">Plane 1</text>
      <line x1="10%" y1="20%" x2="100%" y2="20%" style={{stroke: 'black', strokeWidth:"1"}} />

      <text x="0%" y="60%" id="plane2">Plane 2</text>
      <line x1="10%" y1="60%" x2="100%" y2="60%" style={{stroke: 'black', strokeWidth:"1"}}/>

      <text x="0%" y="100%" id="plane3">Plane 3</text>
      <line x1="10%" y1="100%" x2="100%" y2="100%" style={{stroke: 'black', strokeWidth:"1"}}/>
    </svg>
  </div>
)}

const Separator = ( {id, onHover} ) => {
  return (
    <div id={id} onMouseOver={onHover}>
      <svg width="100%" height = "5px" xmlns="http://www.w3.org/2000/svg">
        <line x1="0%" y1="0%" x2="100%" y2="0%" style={{stroke: 'red', strokeWidth:"2"}} />
      </svg>
    </div>
  )
}

/*
const Operators =  ({operators, getRightMostPosition}) => {
  return(

      <svg width={getRightMostPosition()+'px'} height = "200px" xmlns="http://www.w3.org/2000/svg" className="poulpe" style={{position: 'absolute', zIndex: 0}}>
        {operators.map( (operator, i) => {
          let scroll = $("#inner_graph").scrollLeft()
          let tsp = computeTopPosition("#source" + operator.from._id)
          let ttp = computeTopPosition("#target" + operator.to._id)
          let lsp = computeLeftPosition("#source" + operator.from._id)
          let ltp = computeLeftPosition("#target" + operator.to._id)
          return (
              <line id={i}  key ={i} x1={lsp + scroll} y1={tsp} x2={ltp + scroll} y2={ttp} style={{stroke:"blue", strokeWidth:"2", zIndex:1}}/>
        );
        })}
        </svg>
  );
}
*/
/*
<line
  data-tip data-for={"operator" + i}
  id={i}
  key ={i}
  x1={goRight ? width : 0}
  y1={goUp ? 0 : height}
  x2={goRight ? 0 : width}
  y2={goUp ? height : 0}
  style={{stroke:"blue", strokeWidth:"2", zIndex:10}}/>
  */
const OpPath = ({up, right, i, width, height, leftSource, leftTarget}) => {
  let cornerTop = 0
  let cornerDown = 0
  let startX = 0
  let startY = 0
  if(!up && right) {
    cornerTop = 80
    cornerDown = width - 80
  } else if (!up && !right) {
    startX = width
    cornerTop =  width - 80
    cornerDown = 80
    width = 0
  } else if (up && right) {
    cornerTop = 80
    cornerDown = width - 80
    startY = height
    height = 0
  } else {
    startX = width
    cornerTop = width-80
    cornerDown = 80
    startY = height
    height = 0
    width = 0
  }

  if(Math.abs(leftSource-leftTarget) < 30) {
    return (
      <line
        data-tip data-for={"operator" + i}
        id={i}
        key ={i}
        x1={right ? width : 0}
        y1={up ? 0 : height}
        x2={right ? 0 : width}
        y2={up ? height : 0}
        style={{stroke:"blue", strokeWidth:"2", zIndex:10}}/>
    )
  }

  return(
    <path
      data-tip data-for={"operator" + i}
      id={i}
      key ={i}
      d={"M" + startX + "," + startY + " C"+ cornerTop + "," + startY + " " + cornerDown + "," + height + " " + width + "," + height}
      style={{fill: 'none', stroke: 'blue', strokeWidth: 2}}/>
  )
}

const Operators =  ({operators, getRightMostPosition}) => {
  return(

      <div className="poulpe" style={{position: 'absolute', zIndex: 0, width:(getRightMostPosition()+"px"), height:"200px"}}>
        {operators.map( (operator, i) => {
          let scroll = $("#inner_graph").scrollLeft()
          let tsp = computeTopPosition("#source" + operator.from._id)
          let ttp = computeTopPosition("#target" + operator.to._id)
          let lsp = computeLeftPosition("#source" + operator.from._id)
          let ltp = computeLeftPosition("#target" + operator.to._id)
          let top = Math.min(tsp, ttp)
          let left = Math.min(lsp, ltp)
          let width = Math.abs(ltp-lsp)
          let height = Math.abs(tsp -ttp)
          let goUp = (top == ttp)
          let goRight = (left == lsp)
          return (
            <span key={i} style={{position: 'relative'}}>
              <svg key={i} width={Math.max(width, 5)} height={Math.max(height, 5)} style={{zIndex: 0, position: 'absolute', top: top + scroll, left: left}}>
                <OpPath up={goUp} right={goRight} i={i} width={width} height={height} leftSource={lsp} leftTarget={ltp}/>
              </svg>
              <ReactTooltip id={"operator" + i} type="light" style={{zIndex: 10}}>Operator</ReactTooltip>
            </span>
          )
        })}
      </div>
  )
}


const DragAc = ( {position, plane}) => {
  return (
    <Draggable
      position= {position}
      axis='both'
      disabled= {false}>
        <div data-tip data-for="dragac_tip" data-event-off='mouseDown' style={divStyleNeg}>
          Plane {plane}
          {position.y}
          <ReactTooltip id="dragac_tip" type="light" effect="solid">Some data</ReactTooltip>
        </div>
    </Draggable>
  )
}


const BoxAc = ( {hoverStart, hoverStop, plane, activityID} ) => {
  return(
    <div
      id={"box" + activityID}
      style={divStyleAc}
      onMouseOver={hoverStart}
      onMouseUp={hoverStop}>
      Plane {plane}
    </div>
  )
}

const RenderDraggable = ( { handleHoverStart, handleHoverStop, activities}) => {return(
    <div>
      <div style={divListStyle}>

        {activities.map((activity, i) => {
          return <BoxAc
          hoverStart={(event) => handleHoverStart(event, i%3 +1, activity)}
          hoverStop={handleHoverStop}
          key={i}
          activityID={activity._id}
          plane={i%3 +1} />
        })}
      </div>

    </div>

  )
}

const TempAc = ({handleDragStop, position, plane, current}) => {
  return (
    <div id="dragac" style={{position: "absolute", zIndex: 2}} onMouseUp={(event) => handleDragStop(event, plane, current)}>
      {current ?
      <div  style={{position: "absolute"}}>
        <DragAc
          plane={plane}
          position={position}
        />
      </div>
    : "" }
    </div>
  )
}

const RenderGraph = ( {
  activities,
  positions,
  operators,
  deleteAc,
  handleMove,
  getRightMostPosition,
  sourceOperator,
  targetOperator,
  activitySourceClicked}) => {
  return(

      <div id='inner_graph' style={divStyle}>
        <div style={{position: "relative"}}>
          <Operators operators={operators} getRightMostPosition={getRightMostPosition} />
        </div>

        {activities.map( (activity, i) => {

          return (<DraggableAc
            activity={activity}
            editorMode={true}
            plane={positions[i].plane}
            key={activity._id}
            startTime={45}
            remove={true}
            duration={60}
            defaultPosition={positions[i].position}
            arrayIndex={i}
            handleMove={handleMove}
            delete = {deleteAc}
            sourceOperator = {sourceOperator}
            targetOperator = {targetOperator}
            isSourceClicked = {activitySourceClicked == activity ? true : false}
            />)
        })}

        <div style={{top: 50}} >
          <AxisDisplay getRightMostPosition={getRightMostPosition}/>
        </div>
      </div>

    );
}

const computeTopPosition = (object) => {
  let inner = $("#inner_graph").offset().top
  let elem = $(object).offset().top
  return elem - inner
}

const computeLeftPosition = (object) => {
  let inner = $("#inner_graph").offset().left
  let elem = $(object).offset().left
  return elem - inner
}

export default class Graph extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addedActivities: [],
      addedPositions: [],
      currentDraggable: null,
      currentPlane: 0,
      defPos: {x: 0, y:0},
      separatorHeight: {top: 0, down: 0, left: 0},
      hoverBoxPosition: {x: 0, y:0},
      operators: [],
      currentSource: null,
      test: 0,
    };
  }


  componentDidMount() {
    let inner = $("#inner_graph").offset()
    let top = computeTopPosition("#top")
    let down = computeTopPosition("#down")
    this.setState({separatorHeight: {top: top, down: down, left: inner.left}})
  }

  handleHoverStart = (event, plane, activity) => {
    event.preventDefault();

    let position = $("#box" + activity._id).position()

    this.setState({
      currentPlane: plane,
      currentDraggable: activity,
      hoverBoxPosition: {x: position.left, y: position.top}})
  }

  handleHoverStop = (event) => {
    event.preventDefault();
    this.setState({currentDraggable: null});

  }

  deleteInGraphAc = (activity) => {
    var index = this.state.addedActivities.indexOf(activity)
    if(index != -1) {
      var activitiesLess =
        this.state.addedActivities.slice(0, index).concat(this.state.addedActivities.slice(index+1, this.state.addedActivities.drag))
      var positionsLess =
        this.state.addedPositions.slice(0, index).concat(this.state.addedPositions.slice(index+1, this.state.addedPositions.length))
      this.setState({addedActivities: activitiesLess, addedPositions: positionsLess})
    }
    let filteredOperators = this.state.operators.filter((operator) => {
      return (operator.from._id != activity._id && operator.to._id != activity._id)
    })

    this.setState({operators: filteredOperators})

  }

  handleDragStop = (event, plane, activity) => {
    event.preventDefault();
    var {top, down} = this.state.separatorHeight
    var bpos = event.target.getBoundingClientRect();
    //TODO correct position
    let pos = {top: 250, left: bpos.left + window.scrollX}

    if(pos.top < down && pos.top > top) {

      let newActivity = _.clone(activity, true);
      newActivity._id = uuid();

      var innerGraphScrollX =  $("#inner_graph").scrollLeft()
      let correctedPosition = {x: pos.left, y: pos.top}

      correctedPosition.x += innerGraphScrollX
      //correctedPosition.y += this.state.separatorHeight.top
      var newElement = {position: correctedPosition, plane: plane}
      newElement.plane += 0 //TODO insertion fail if a field of newElement is not used at least once before
      var activitiesMore = this.state.addedActivities.concat(newActivity)
      var positionsMore = this.state.addedPositions.concat(newElement)

      this.setState({addedActivities: activitiesMore, addedPositions: positionsMore})
    }

    this.setState({currentDraggable: null});
  }

  handleMove = (arrayIndex, position) => {

    let activityMoved = this.state.addedPositions[arrayIndex]
    activityMoved.position = position
    let modifiedAddedPositions = this.state.addedPositions
      .slice(0, arrayIndex)
      .concat(activityMoved)
      .concat(this.state.addedPositions
                .slice(arrayIndex+1, this.state.addedPositions.length))
    this.setState({addedPositions: modifiedAddedPositions})
  }

  getRightMostPosition = () => {
    let {addedPositions} = this.state
    let position = 0
    if(addedPositions.length > 0) {
      let mappedPosition = addedPositions.map(addedPosition => {return addedPosition.position.x})
      position = Math.max(...mappedPosition)
      console.log(position)
    }
    console.log("right most" + position)
    return (position >= 1000) ? position + 300 : 1000;

  }

  sourceClicked = (source) => {
    if(source === this.state.currentSource) {
      this.setState({currentSource:null});
    }
    else {
      this.setState({currentSource:source});
    }
  }

  addNewOperator = (target) => {
    if(this.state.currentSource != null) {
      let newOperators = this.state.operators.concat({from:this.state.currentSource, to:target});
      this.setState({currentSource:null, operators:newOperators});
    }
  }

  render() {
    return (
      <div id="graph-summary" >
          <Separator id='top' key={1} style={{position: 'relative'}}/>

          <RenderGraph
            id = 'planes'
            activities={this.state.addedActivities}
            positions={this.state.addedPositions}
            operators={this.state.operators}
            deleteAc={this.deleteInGraphAc}
            handleMove={this.handleMove}
            getRightMostPosition={this.getRightMostPosition}
            sourceOperator = {this.sourceClicked}
            targetOperator = {this.addNewOperator}
            activitySourceClicked = {this.state.currentSource}
            />

          <Separator id='down' key={2} style = {{position: 'relative'}} />

          <TempAc
            handleDragStop = {this.handleDragStop}
            position = {this.state.hoverBoxPosition}
            plane = {this.state.currentPlane}
            current = {this.state.currentDraggable}/>

          <RenderDraggable
            id='list'
            handleHoverStart={this.handleHoverStart}
            handleHoverStop={this.handleHoverStop}
            activities = {this.props.activities}/>

      </div>
    );
  }
}


Graph.propTypes = {
  activities: PropTypes.array.isRequired,
};

const divStyle = {
  position: "static",
  zIndex: 0,
  height: 300,
  width: "100%",
  overflowX: "scroll",
  overflowY: "hidden",
  border: 2,
  borderStyle: "solid",
  borderColor: "yellow"
}

const divListStyle = {
  position: "relative",
  height: 300,
  width: "100%",
  border: 1,
  borderStyle: "solid",
  borderColor: "black"
}

const divStyleNeg = {
  background: "white",
  border: 2,
  width: 60,
  height: 40,
  margin: 10,
  padding: 10,
  float: "left",
  position: "absolute",
  borderStyle: "solid",
  borderColor: "red"

}

const divStyleAc = {
  background: "white",
  border: 2,
  width: 60,
  height: 40,
  margin: 10,
  padding: 10,
  float: "left",
  position: "relative",
  borderStyle: "solid",
  borderColor: "grey"

}
