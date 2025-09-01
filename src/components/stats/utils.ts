const nf0 = new Intl.NumberFormat("en-US", { maximumFractionDigits: 0 });
const nf2 = new Intl.NumberFormat("en-US", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
});

export function fmt(label: string, v: number | string, k = false) {
  let s: string;
  if (typeof v === "number") {
    const n = k ? v / 1000 : v;
    const base = (k ? nf2 : nf0).format(n);
    s = base + (k ? "K" : "");
  } else {
    s = v;
  }
  return `<div><label>${label}</label><span>${s}</span></div>`;
}
