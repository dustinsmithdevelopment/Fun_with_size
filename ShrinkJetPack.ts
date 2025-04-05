import {
    ButtonIcon,
    CodeBlockEvents,
    Component,
    EntityInteractionMode,
    EventSubscription,
    GrabbableEntity,
    Player,
    PlayerControls,
    PlayerInput,
    PlayerInputAction,
    PropTypes,
    Quaternion,
    SerializableState,
    Vec3,
    VoipSettingValues,
    World
} from "horizon/core";

class ShrinkJetPack extends Component {
    static propsDefinition = {
        shrinkScale: {type: PropTypes.Number},
        time_to_reset: {type: PropTypes.Number}
    };
    private homePosition: Vec3|undefined;
    private homeRotation: Quaternion|undefined;
    private resetTimer: number|undefined;
    private updateEvent: EventSubscription|undefined;
    private leftTrigger: PlayerInput|undefined;
    private rightTrigger: PlayerInput|undefined;
    
    start() {
        this.homePosition = this.entity.position.get();
        this.homeRotation = this.entity.rotation.get();
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnGrabStart, (_, player:Player)=>{this.handleGrab(player)});
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnGrabEnd, (player:Player)=>{this.handleRelease(player)});
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnAttachStart, (player:Player)=>{this.handleAttach(player)});
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnAttachEnd, (player:Player)=>{this.handleDetach(player)});

    }
    handleGrab(p: Player) {
        this.cancelResetPosition();
        if (this.entity.owner.get().id !== p.id) this.entity.owner.set(p);
    }
    handleRelease(p: Player) {
        this.scheduleResetPosition();
    }
    handleAttach(p: Player) {
        this.entity.interactionMode.set(EntityInteractionMode.Physics);
        p.gravity.set(0);
        p.avatarScale.set(this.props.shrinkScale);
        // TODO test how this works
        p.setVoipSetting(VoipSettingValues.Whisper);

        this.leftTrigger = PlayerControls.connectLocalInput(PlayerInputAction.LeftTrigger, ButtonIcon.None, this, {})
        this.rightTrigger = PlayerControls.connectLocalInput(PlayerInputAction.RightTrigger, ButtonIcon.None, this, {})

        this.updateEvent = this.connectLocalBroadcastEvent(World.onUpdate, this.handleUpdate.bind(this));
    }
    handleDetach(p: Player) {
        this.entity.interactionMode.set(EntityInteractionMode.Grabbable);
        p.gravity.set(9.81);
        p.avatarScale.set(1);
        // TODO to undo the test
        p.setVoipSetting(VoipSettingValues.Environment);

        this.updateEvent?.disconnect;
    }
    handleUpdate() {
        const owner = this.entity.owner.get();
        if (this.leftTrigger?.held.get() || this.rightTrigger?.held.get()){
            const forward = owner!.head.forward.get().mul(2);
            owner.velocity.set(forward);
        }else {
            owner.velocity.set(Vec3.zero);
        }

        
    }

    resetPosition(){
        this.entity.position.set(this.homePosition!);
        this.entity.rotation.set(this.homeRotation!);
        this.resetTimer = undefined;
    }
    scheduleResetPosition(){
        this.resetTimer = this.async.setTimeout(this.resetPosition.bind(this), this.props.time_to_reset * 1000);
    }
    cancelResetPosition(){
        if (this.resetTimer){
            this.async.clearTimeout(this.resetTimer);
            this.resetTimer = undefined;
        }
    }
    transferOwnership(_oldOwner: Player, _newOwner: Player): SerializableState {
        return { position:this.homePosition!, rotation:this.homeRotation!}
    }
    receiveOwnership(state: {position: Vec3, rotation: Quaternion}, _oldOwner: Player, _newOwner: Player) {
        this.homePosition = state.position;
        this.homeRotation = state.rotation;
    }
}
Component.register(ShrinkJetPack);
