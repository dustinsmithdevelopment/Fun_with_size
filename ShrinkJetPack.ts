import {
    AttachableEntity,
    ButtonIcon,
    CodeBlockEvents,
    Component,
    Entity,
    EntityInteractionMode,
    EventSubscription,
    NetworkEvent,
    Player,
    PlayerControls,
    PlayerInput,
    PlayerInputAction,
    PropTypes,
    Vec3,
    VoipSettingValues,
    World
} from "horizon/core";

const removeJetPackEvent = new NetworkEvent<{}>('removeJetPack');
const resetJetPackEvent = new NetworkEvent<{}>('resetJetPack');

class ShrinkJetPack extends Component {
    static propsDefinition = {
        targetScale: {type: PropTypes.Number},
        targetSpeed: {type: PropTypes.Number},
        time_to_reset: {type: PropTypes.Number},
        positionRef: {type: PropTypes.Entity}
    };
    private resetTimer: number|undefined;
    private updateEvent: EventSubscription|undefined;
    private leftTrigger: PlayerInput|undefined;
    private rightTrigger: PlayerInput|undefined;
    preStart() {
        this.connectNetworkEvent(this.entity, removeJetPackEvent, ()=>{
            this.entity.as(AttachableEntity).detach();
        });
        this.connectNetworkEvent(this.entity, resetJetPackEvent, this.resetPosition.bind(this));
    }

    start() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnGrabStart, (_, player:Player)=>{this.handleGrab(player)});
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnGrabEnd, (player:Player)=>{this.handleRelease(player)});
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnAttachStart, (player:Player)=>{this.handleAttach(player)});
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnAttachEnd, (player:Player)=>{this.handleDetach(player)});

    }
    handleGrab(p: Player) {
        this.cancelResetPosition();
        if (this.entity.owner.get().id !== p.id) {
            this.entity.owner.set(p);
        }
    }
    handleRelease(p: Player) {
        this.scheduleResetPosition();
    }
    handleAttach(p: Player) {
        this.entity.interactionMode.set(EntityInteractionMode.Physics);
        p.gravity.set(0);
        p.avatarScale.set(this.props.targetScale);

        this.leftTrigger = PlayerControls.connectLocalInput(PlayerInputAction.LeftTrigger, ButtonIcon.None, this, {})
        this.rightTrigger = PlayerControls.connectLocalInput(PlayerInputAction.RightTrigger, ButtonIcon.None, this, {})

        this.updateEvent = this.connectLocalBroadcastEvent(World.onUpdate, this.handleUpdate.bind(this));
    }
    handleDetach(p :Player) {
        this.entity.interactionMode.set(EntityInteractionMode.Grabbable);
        p!.gravity.set(9.81);
        p!.avatarScale.set(1);
        this.updateEvent?.disconnect;
        // this.resetPosition();
        this.entity.owner.set(this.world.getServerPlayer());
    }
    handleUpdate() {
        const owner = this.entity.owner.get();
        if (this.leftTrigger?.held.get() || this.rightTrigger?.held.get()){
            const forward = owner!.head.forward.get().mul(this.props.targetSpeed);
            owner.velocity.set(forward);
        }else {
            owner.velocity.set(Vec3.zero);
        }

        
    }

    resetPosition(){
            const positionReference: Entity = this.props.positionRef;
            this.entity.position.set(positionReference.position.get());
            this.entity.rotation.set(positionReference.rotation.get());
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
}
Component.register(ShrinkJetPack);

class JetPackRemover extends Component {
    start() {
        this.connectCodeBlockEvent(this.entity, CodeBlockEvents.OnEntityEnterTrigger, (enteredBy: Entity)=>{
            this.sendNetworkEvent(enteredBy, removeJetPackEvent, {});
            this.async.setTimeout(()=>{this.sendNetworkEvent(enteredBy, resetJetPackEvent, {})}, 250);
        });
    }
}
Component.register(JetPackRemover);
