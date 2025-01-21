import Vector from "../../numeric/Vector.js";

export default class Vehicle {
    constructor(track, runner) {
        this.track = track;
        this.runner = runner;
        this.friction = 0.99;

        this.distance = 0;
        this.direction = 1;
        this.gravity = new Vector(0, 0.3);

        this.slow = false;
        this.slowParity = 0;

        this.color = '#000';
        this.headGear = 'hat';
    }

    turn() {}

    clone() {}

    /** @param {boolean} slow */
    setSlow(slow) {
        if ((!this.slow && slow) || !slow) {
            this.slowParity = 0;
        }
        this.slow = slow;
    }
}