import {CodeBlockEvent, Component, Player, PropTypes} from "horizon/core";

const
    scaleEvent =
        // send a CodeBlock event named scalePlayer with a Player, the scale as a number, and the speed as a number
        new CodeBlockEvent <[ p: Player, scale: number, speed: number]>("scalePlayer", [PropTypes.Player, PropTypes.Number, PropTypes.Number]);


class Scale extends Component {
    static propsDefinition = {};


  start() {
    this.connectCodeBlockEvent(
        this.entity, scaleEvent, (p: Player, scale: number, speed: number)=>{
            p.avatarScale.set(scale);
            p.locomotionSpeed.set(speed);
        });
  }
}
Component.register(Scale);