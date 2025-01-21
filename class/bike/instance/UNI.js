import Part from '../../entity/Part.js';
import Vector from '../../numeric/Vector.js';
import Spring from '../physics/Spring.js';
import Vehicle from './Vehicle.js';
import Wheel from '../../entity/Wheel.js';

class Rope extends Spring {
    constructor(a, b) {
        super(a, b);
    }

    fixedUpdate() {
        let distance = this.b.pos.sub(this.a.pos);
        let length = distance.getLength();
        if (length < 1) {
            return this;
        }
        distance = distance.scale(1 / length);
        let force = distance.scale((length - this.len) * this.springConstant);
        let normalVelocity =
            this.b.velocity.sub(this.a.velocity).dot(distance) *
            this.dampConstant;
        force.selfAdd(distance.scale(normalVelocity * 0.5));
        // line missing here because ropes only put force on one of their masses
        // (this is canonical to the original fr2 source)
        this.a.velocity.selfAdd(force);
        return this;
    }

    clone() {
        let clone = new Rope(this.a, this.b);
        clone.lengthTowards = this.lengthTowards;
        clone.len = this.len;
        clone.dampConstant = this.dampConstant;
        clone.springConstant = this.springConstant;
        return clone;
    }
}

export default class UNI extends Vehicle {
    constructor(track, runner) {
        super(track, runner);

        this.rotationFactor = 10;

        this.hitbox = new Part(new Vector(), this);
        this.hitbox.drive = () => this.runner.crash();
        this.wheel = new Wheel(new Vector(), this);
        this.backWheel = this.frontWheel = this.wheel;
        this.arm = new Part(new Vector(), this);

        this.headToWheel = new Spring(this.hitbox, this.wheel);
        this.headToArm = new Rope(this.arm, this.hitbox);
        this.headToWheel.lengthTowards = this.headToWheel.len = 52;
        this.headToArm.lengthTowards = this.headToArm.len = 25;

        // this isn't canon but i think it could be interesting
        this.wheelToArm = new Rope(this.arm, this.wheel);
        this.wheelToArm.lengthTowards = this.wheelToArm.len = 25;
        this.wheelToArm.springConstant = 0;

        this.hitbox.size = 13;
        this.wheel.size = 13;
        this.arm.size = 4;

        this.points = [this.hitbox, this.wheel, this.arm];
        this.joints = [this.headToWheel, this.headToArm];

        /** @type {Map<string, Array<string>>} */
        this.keyLog = new Map();
        this.keyLog.set('upPressed', new Array());
        this.keyLog.set('downPressed', new Array());
        this.keyLog.set('leftPressed', new Array());
        this.keyLog.set('rightPressed', new Array());
        this.keyLog.set('turnPressed', new Array());
        this.keyLog.set('crouchPressed', new Array());

        this.setBikeInitialState(track.origin);
        this.slow = true;
    }

    turn() {
        this.direction *= -1;
    }

    updatePhysics() {
        if (this.runner.turnPressed) {
            this.turn();
        }
    
        let up = this.runner.upPressed,
            speed = 3 * (up + 1),
            amount = 10;
    
        this.headToWheel.lean(2 * amount * up, speed);
        this.headToArm.lean(amount * up, speed);
    
        let rotate = this.runner.leftPressed - this.runner.rightPressed,
            dirFactor = Math.sign(rotate) == this.direction ? 1 : 0.8;
        this.wheel.speedValue += (rotate * 0.5 * this.direction * dirFactor - this.wheel.speedValue) / 5;
        this.headToWheel.rotate(rotate * dirFactor / this.rotationFactor);
        this.distance += this.wheel.rotationSpeed;
    
        let targetLength = this.runner.crouchPressed ? this.headToWheel.lengthTowards * 0.8 : this.headToWheel.lengthTowards;
        this.headToWheel.len += (targetLength - this.headToWheel.len) * 0.25;
    
        if (this.runner.crouchPressed) {
            this.headToWheel.lean(5, speed);
        }
    }
    
    

    setBikeInitialState(startPos) {
        this.hitbox.pos = new Vector(startPos.x, startPos.y - 15);
        this.hitbox.oldPos = this.hitbox.pos.clone();
        this.hitbox.displayPos = this.hitbox.pos.clone();
        this.wheel.pos = new Vector(startPos.x, startPos.y + 35);
        this.wheel.oldPos = this.wheel.pos.clone();
        this.wheel.displayPos = this.wheel.pos.clone();
        this.arm.pos = new Vector(startPos.x + 10, startPos.y + 15);
        this.arm.oldPos = this.arm.pos.clone();
        this.arm.displayPos = this.arm.pos.clone();
    }

    // this is from the getStick function in the source
    getRider() {
        let rider = {};

        let headToWheel = this.hitbox.pos.sub(this.wheel.pos);
        let pedalPos = new Vector(
            6 * Math.cos(this.distance, 6 * Math.sin(this.distance))
        );

        rider.head = this.wheel.pos.add(headToWheel);
        rider.hand = this.arm.pos.clone();
        rider.shadowHand = this.arm.pos.clone();
        rider.hip = this.wheel.pos.add(headToWheel.scale(0.5));
        rider.foot = this.wheel.pos.add(pedalPos);
        rider.shadowFoot = this.wheel.pos.sub(pedalPos);

        rider.elbow = this.arm.pos.add(rider.head).scale(0.5);
        rider.shadowElbow = rider.elbow.clone();

        rider.knee = rider.hip.add(rider.foot).scale(0.5);
        rider.shadowKnee = rider.hip.add(rider.shadowFoot).scale(0.5);

        return rider;
    }

    clone() {
        let clone = new this.constructor(this.track, this.runner);

        clone.friction = this.friction;

        clone.distance = this.distance;
        clone.direction = this.direction;
        clone.gravity = this.gravity;

        clone.slow = this.slow;
        clone.slowParity = this.slowParity;

        clone.color = this.color;
        clone.headGear = this.headGear;

        clone.rotationFactor = this.rotationFactor;

        clone.wheel = this.wheel.clone();
        clone.wheel.bike = clone;
        clone.backWheel = clone.wheel;
        clone.frontWheel = clone.wheel;

        clone.hitbox = this.hitbox.clone();
        clone.hitbox.bike = clone;
        clone.hitbox.drive = () => clone.runner.crash();

        clone.arm = this.arm.clone();
        clone.arm.bike = clone;

        clone.headToWheel = this.headToWheel.clone();
        clone.headToWheel.a = clone.hitbox;
        clone.headToWheel.b = clone.wheel;

        clone.headToArm = this.headToArm.clone();
        clone.headToArm.a = clone.arm;
        clone.headToArm.b = clone.hitbox;

        clone.wheelToArm = this.wheelToArm.clone();
        clone.wheelToArm.a = clone.arm;
        clone.wheelToArm.b = clone.wheel;

        clone.points = [clone.hitbox, clone.wheel, clone.arm];
        clone.joints = [clone.headToWheel, clone.headToArm];

        let keyLogClone = new Map();
        keyLogClone.set('upPressed', [...this.keyLog.get('upPressed')]);
        keyLogClone.set('downPressed', [...this.keyLog.get('downPressed')]);
        keyLogClone.set('leftPressed', [...this.keyLog.get('leftPressed')]);
        keyLogClone.set('rightPressed', [...this.keyLog.get('rightPressed')]);
        keyLogClone.set('turnPressed', [...this.keyLog.get('turnPressed')]);
        keyLogClone.set('crouchPressed', [...this.keyLog.get('turnPressed')]);

        return clone;
    }

    setSlow() {
        
    }
}
