import {CodeBlockEvent, CodeBlockEvents, Component, Player, PropTypes} from "horizon/core";

class Scale extends Component<typeof Scale> {
  static propsDefinition = {
    scale: {type: PropTypes.Number}
  };

  start() {
    this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnGrabStart, (_, player: Player)=>{player.avatarScale.set(this.props.scale);});
  }
}
Component.register(Scale);