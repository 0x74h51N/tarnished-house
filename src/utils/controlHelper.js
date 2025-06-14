export const controlHelper = (c) =>
  c.type === "range"
    ? `<label>${c.label}:<input type="range" id="${c.id}" 
        min="${c.min}" max="${c.max}" step="${c.step}" 
        value="${c.value}"/><span id="${c.span}">${c.value}
        </span>
        </label><br/>`
    : c.type === "checkbox"
    ? `<label><input type="checkbox" id="${c.id}"${
        c.checked ? " checked" : ""
      }/> ${c.label}</label><br/>`
    : c.type === "select"
    ? `<label>${c.label}:<select id="${c.id}">${c.options
        .map(
          (o) =>
            `<option value="${o.v}"${o.s ? " selected" : ""}>${o.t}</option>`
        )
        .join("")}</select></label><br/>`
    : "";
