import {CodeBlockEvent, CodeBlockEvents, Component, Player, PropTypes} from "horizon/core";

// "const" states that this is a variable that is not supposed to be changed, you can use "let" instead if it can be changed
const
    // this is the name of the variable to be used later
    scaleEvent =
        // this states to make a new object of type CodeBlockEvent
        new CodeBlockEvent <[
            // the first argument passed to the event will be an item of type Player that can be referenced later by the name "p"
            p: Player,
            // the second argument passed to the event will be an item of type number that can be referenced later by the name "scale"
            scale: number,
        ]>(
            // this is the name of the CodeBlock Event
            "scalePlayer",
            // these are a redefiniton of the types passed to the event as PropTypes
            [PropTypes.Player, PropTypes.Number]);


// class states that you are making a new object (something horizon can see, typically a script)
class
  // this is the name of the class, also what will be references in the script list FileName:ClassName
      Scale
  // extends means that the class you are making shares the behavior of whatever it extends
    extends
        // component is a meta defined class for adding functionality to things
        Component {

  // these are the items that will be passed as pills to the script, but none are needed in this case
  static propsDefinition = {};


  // start is run at the start of the world
  start() {
    // this connects an action to happen when the object the script is attached to receives the specified event
    this.connectCodeBlockEvent(
        // this is the object that receives the event, in this case "this.entity" means the object that the script is attached to
        this.entity,
        // this is the event to listen for, in this case the one we made earlier
        scaleEvent, (p: Player, scale: number)=>{
          // I think this next line is pretty self-explanatory
          p.avatarScale.set(scale);
        });
  }
}
// register the class you just made with horizon so that it can see it
Component.register(Scale);