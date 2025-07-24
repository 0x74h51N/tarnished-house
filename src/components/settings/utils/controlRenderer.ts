import { GeneralControl } from "../types";

export const controlRenderer = (c: GeneralControl) =>
  c.type === "range"
    ? `<label class="control-label range-control">${c.label}:<input type="range" id="${c.id}" 
        min="${c.min}" max="${c.max}" step="${c.step}" 
        value="${c.value}"/><span id="${c.span}" class="range-value">${c.value}
        </span>
        </label>`
    : c.type === "checkbox"
    ? `<label class="control-label checkbox-control"><input type="checkbox" id="${
        c.id
      }"${c.checked ? " checked" : ""}/> ${c.label}</label>`
    : c.type === "select"
    ? `<label class="control-label select-control">${c.label}:<select id="${
        c.id
      }">${c.options
        .map(
          (o) =>
            `<option value="${o.v}"${o.s ? " selected" : ""}>${o.t}</option>`
        )
        .join("")}</select></label>`
    : "";
