import type { GeneralControl } from "./types";

export const inputRender = (c: GeneralControl) => {
  const tipSup = c.tooltip
    ? `<sup class="control-tip" title="${c.tooltip}" aria-label="info">?</sup>`
    : "";

  return c.type === "range"
    ? `<label class="control-label range-control">
        ${c.label}${tipSup}
        <input type="range" id="${c.id}" 
          min="${c.min}" max="${c.max}" step="${c.step}" 
          value="${c.value}"/>
        <span id="${c.span}" class="range-value ${c.hide && "hidden"}">
          ${c.value}
        </span>
      </label>`
    : c.type === "checkbox"
      ? `<label class="control-label checkbox-control">
        <input type="checkbox" id="${c.id}"${c.checked ? " checked" : ""}/> 
        ${c.label}${tipSup}
      </label>`
      : c.type === "select"
        ? `<label class="control-label select-control">
        <div>${c.label}${tipSup}</div>
        <select id="${c.id}">
          ${c.options
            .map(
              (o) =>
                `<option value="${o.v}"${o.s ? " selected" : ""}>${o.t}</option>`
            )
            .join("")}
        </select>
      </label>`
        : "";
};
