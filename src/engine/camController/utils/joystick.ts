import nipplejs, {
  type JoystickManager,
  type JoystickOutputData
} from "nipplejs";
import type { JoystickArgs } from "../controller/types";
import { applyAnchors } from "./helpers";

let num = 0;
export function createJoystick({
  position,
  size,
  multitouch,
  restOpacity = 0.2
}: JoystickArgs) {
  const ZONE_SCALE = 1.25;
  const ZONE_PAD_PX = 30;
  const zoneSize = Math.round(size * ZONE_SCALE + ZONE_PAD_PX);
  const zone = document.createElement("div");
  zone.setAttribute("data-joy-zone", (num++).toString());
  Object.assign(zone.style, {
    position: "fixed",
    width: `${zoneSize}px`,
    height: `${zoneSize}px`,
    pointerEvents: "auto",
    touchAction: "none",
    userSelect: "none",
    zIndex: "2147483647",
    overflow: "visible"
  } as CSSStyleDeclaration);

  applyAnchors(zone, position, zoneSize / 2);

  document.body.appendChild(zone);

  const manager: JoystickManager = nipplejs.create({
    zone,
    mode: "static",
    position: { left: "50%", top: "50%" },
    size,
    multitouch,
    restOpacity
  });

  const vec = { x: 0, y: 0, mag: 0 };

  manager.on("move", (_evt, data: JoystickOutputData) => {
    const force = Math.min(1, data.force || 0);
    const rad = data.angle.radian;
    vec.x = Math.cos(rad) * force;
    vec.y = Math.sin(rad) * force;
    vec.mag = force;
  });

  manager.on("end", () => {
    vec.x = 0;
    vec.y = 0;
    vec.mag = 0;
  });
  const show = () => {
    zone.style.display = "block";
    zone.style.pointerEvents = "auto";
  };

  const hide = () => {
    zone.style.display = "none";
    zone.style.pointerEvents = "none";
    vec.x = 0;
    vec.y = 0;
    vec.mag = 0;
  };

  return {
    get: () => vec,
    show,
    hide,
    destroy: () => {
      manager.destroy();
      zone.remove();
    }
  };
}
