import LinePath from '../../../numeric/LinePath.js';
import Transform from '../../../numeric/Transform.js';
import Vector from '../../../numeric/Vector.js';
import UNI from '../UNI.js';

export default class UNIRenderer {
    /**
     *
     * @param {CanvasRenderingContext2D} ctx
     * @param {UNI} bike
     * @param {number} opacityFactor
     */
    static render(ctx, bike, opacityFactor) {
        let head = bike.hitbox.displayPos.toPixel(bike.track);
        let wheel = bike.wheel.displayPos.toPixel(bike.track);
        let arm = bike.arm.displayPos.toPixel(bike.track);
    
        let headToWheel = head.sub(wheel);
        let crossVector = new Vector(
            -headToWheel.y * bike.direction,
            headToWheel.x * bike.direction
        );
    
        let wheelLineWidth = 3.5;
        let wheelRadius =
            (bike.wheel.size - wheelLineWidth / 2) * bike.track.zoomFactor;
    
        let pedalRelativePos = new Vector(
            5 * bike.track.zoomFactor * Math.cos(bike.distance),
            5 * bike.track.zoomFactor * Math.sin(bike.distance)
        );
        let pedalA = wheel.add(pedalRelativePos);
        let pedalB = wheel.sub(pedalRelativePos);
    
        let unicycleTransform = new Transform(wheel, headToWheel, crossVector);
    
        ctx.strokeStyle = bike.color;
        ctx.globalAlpha = opacityFactor;
        ctx.lineWidth = wheelLineWidth * bike.track.zoomFactor;
        ctx.lineCap = "round";
    
        ctx.beginPath();
        ctx.arc(wheel.x, wheel.y, wheelRadius, 0, 2 * Math.PI, true);
        ctx.stroke();
    
        ctx.lineWidth = 3 * bike.track.zoomFactor;
        LinePath.render(ctx, [[wheel, wheel.add(headToWheel.scale(0.5))]]);
    
        ctx.lineWidth = 4 * bike.track.zoomFactor;
        LinePath.render(ctx, [
            [
                unicycleTransform.scale(0.52, -0.1),
                unicycleTransform.scale(0.5, 0),
                unicycleTransform.scale(0.52, 0.1),
            ],
        ]);
    
        ctx.lineWidth = 2 * bike.track.zoomFactor;
        LinePath.render(ctx, [[pedalA, pedalB]]);
    
        if (bike.runner.dead) {
            return;
        }
    
        let midwayUp = wheel.add(headToWheel.scale(0.6));
        let legPartLength = 10 * bike.track.zoomFactor;
        let sumOfLegPartsLengthsSquared = 2.5 * legPartLength ** 2;
    
        function calculateKnee(pedal) {
            let hipToFootDistance = pedal.sub(midwayUp);
            let hipToFootDistancePerpendicular = new Vector(
                hipToFootDistance.y * bike.direction,
                -hipToFootDistance.x * bike.direction
            );
            let legLengthRatio = sumOfLegPartsLengthsSquared / hipToFootDistance.lengthSquared();
            return midwayUp
                .add(hipToFootDistance.scale(0.5))
                .add(hipToFootDistancePerpendicular.scale(legLengthRatio));
        }
    
        let kneeA = calculateKnee(pedalA);
        let kneeB = calculateKnee(pedalB);
    
        ctx.lineWidth = 6 * bike.track.zoomFactor;
        LinePath.render(ctx, [
            [pedalA, kneeA, midwayUp],
            [pedalB, kneeB, midwayUp],
        ]);
    
        ctx.lineWidth = 7 * bike.track.zoomFactor;
        LinePath.render(ctx, [[midwayUp, midwayUp.add(headToWheel.scale(0.42))]]);
    
        ctx.lineWidth = 4 * bike.track.zoomFactor;
        LinePath.render(ctx, [[midwayUp.add(headToWheel.scale(0.46)), arm]]);
      

      //unsure about these
      let forCircles = midwayUp
        .add(headToWheel.scale(0.56))
        .add(crossVector.scale(0.04));
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      ctx.arc(
        forCircles.x,
        forCircles.y,
        2 * bike.track.zoomFactor,
        0,
        2 * Math.PI,
        true
      );
      ctx.fill();

      ctx.fillStyle = "#000";
      ctx.lineWidth = 2 * bike.track.zoomFactor;
      ctx.beginPath();
      ctx.arc(
        forCircles.x,
        forCircles.y,
        5 * bike.track.zoomFactor,
        0,
        2 * Math.PI,
        true
      );

      //head
      let headRadius = 5 * bike.track.zoomFactor;
      let headCenter = unicycleTransform.scale(1.1, 0);
      ctx.lineWidth = 2 * bike.track.zoomFactor;
      ctx.fillStyle = "#fff";
      ctx.beginPath();
      ctx.moveTo(headCenter.x + headRadius, headCenter.y);
      ctx.arc(headCenter.x, headCenter.y, headRadius, 0, 2 * Math.PI, true);
      ctx.fill();
      ctx.stroke();
      // head gear
      let playerTransform = new Transform(wheel, crossVector, headToWheel);
      let offsetX = playerTransform.x.scale(0.13);
      let offsetY = playerTransform.y.scale(-0.03);
      let hatFrontBottom = playerTransform.scale(0.28, 1.15).sub(offsetX).sub(offsetY);
      let hatBackBottom = playerTransform.scale(-0.03, 1.1).sub(offsetX).sub(offsetY);
      let hatFront = playerTransform.scale(0.20, 1.13).sub(offsetX).sub(offsetY);
      let hatBack = playerTransform.scale(0.05, 1.11).sub(offsetX).sub(offsetY);
      let hatFrontTop = hatFrontBottom
        .sub(playerTransform.x.scale(0.08))
        .selfAdd(playerTransform.y.scale(0.13));
      let hatBackTop = hatBackBottom
        .add(playerTransform.x.scale(0.04))
        .selfAdd(playerTransform.y.scale(0.15));

      ctx.fillStyle = bike.color;
      LinePath.render(ctx, [
        [
          hatFrontBottom,
          hatFront,
          hatFrontTop,
          hatBackTop,
          hatBack,
          hatBackBottom,
        ],
      ]);
      ctx.fill();

      ctx.strokeStyle = "#000";
      ctx.globalAlpha = 1;
    }
}
