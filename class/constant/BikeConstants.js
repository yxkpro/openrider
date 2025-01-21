import BMX from "../bike/instance/BMX.js";
import MTB from "../bike/instance/MTB.js";
import UNI from "../bike/instance/UNI.js";
import BMXRenderer from "../bike/instance/renderer/BMXRenderer.js";
import MTBRenderer from "../bike/instance/renderer/MTBRenderer.js";
import UNIRenderer from "../bike/instance/renderer/UNIRenderer.js";

export const
    BIKE_MAP = { 'BMX': BMX, 'MTB': MTB, 'UNI': UNI },
    SWITCH_MAP = { 'BMX': MTB, 'MTB': UNI, 'UNI': BMX },
    RENDERER_MAP = { 'BMX': BMXRenderer, 'MTB': MTBRenderer, 'UNI': UNIRenderer };