/** 溢出容器仍用 overflow: auto。原生滚动条宽为 0（不占槽）。
 * 指针停在边缘约 --sb-track 的轨迹上时，才画出较粗的半透明滑块。
 * WebKit / WebView2 不能用轨迹 :hover 选中滑块，所以判断放在工作台已有的指针层。 */

const MIN_THUMB = 24;

export function hitAxis(
  box: { left: number; top: number; right: number; bottom: number },
  x: number,
  y: number,
  trackX: number,
  trackY: number,
  canX: boolean,
  canY: boolean,
  rtl: boolean
): "x" | "y" | null {
  const onY = canY && y >= box.top && y <= box.bottom && (rtl ? x >= box.left - 1 && x <= box.left + trackX : x >= box.right - trackX && x <= box.right + 1);
  const onX = canX && x >= box.left && x <= box.right && y >= box.bottom - trackY && y <= box.bottom + 1;
  if (onY && onX) return (rtl ? x - box.left : box.right - x) <= box.bottom - y ? "y" : "x";
  if (onY) return "y";
  if (onX) return "x";
  return null;
}

interface Hot {
  el: HTMLElement;
  axis: "x" | "y";
}

interface Drag extends Hot {
  start: number;
  scroll: number;
  travel: number;
  max: number;
  scale: number;
  view: number;
}

interface Box {
  left: number;
  top: number;
  width: number;
  height: number;
  travel: number;
  max: number;
  view: number;
}

export function bindOverlayScroll(root: HTMLElement): () => void {
  const thumb = document.createElement("div");
  thumb.className = "wb-sb-thumb";
  thumb.setAttribute("aria-hidden", "true");
  root.appendChild(thumb);

  let hot: Hot | null = null;
  let drag: Drag | null = null;
  let eatClick = false;

  const px = (name: string, fallback: number) => {
    const n = parseFloat(getComputedStyle(root).getPropertyValue(name));
    return Number.isFinite(n) && n > 0 ? n : fallback;
  };

  const hide = () => {
    if (hot) {
      hot.el.classList.remove("wb-sb", "wb-sb-x", "wb-sb-y");
      hot = null;
    }
    thumb.classList.remove("on");
  };

  const locked = (el: HTMLElement) => el.classList.contains("wb-tabs");

  const axisAt = (el: HTMLElement, x: number, y: number): "x" | "y" | null => {
    if (locked(el) || el === thumb) return null;
    const cs = getComputedStyle(el);
    const oy = cs.overflowY;
    const ox = cs.overflowX;
    const scrollable = (v: string) => v === "auto" || v === "scroll" || v === "overlay";
    const canY = scrollable(oy) && el.scrollHeight > el.clientHeight + 1;
    const canX = scrollable(ox) && el.scrollWidth > el.clientWidth + 1;
    if (!canY && !canX) return null;
    const rect = el.getBoundingClientRect();
    if (rect.width < 1 || rect.height < 1 || !el.offsetWidth || !el.offsetHeight) return null;
    const scaleX = rect.width / el.offsetWidth;
    const scaleY = rect.height / el.offsetHeight;
    const track = px("--sb-track", 12);
    const right = rect.right - (parseFloat(cs.borderRightWidth) || 0) * scaleX;
    const left = rect.left + (parseFloat(cs.borderLeftWidth) || 0) * scaleX;
    const top = rect.top + (parseFloat(cs.borderTopWidth) || 0) * scaleY;
    const bottom = rect.bottom - (parseFloat(cs.borderBottomWidth) || 0) * scaleY;
    return hitAxis({ left, top, right, bottom }, x, y, track * scaleX, track * scaleY, canX, canY, cs.direction === "rtl");
  };

  const find = (node: Element, x: number, y: number): Hot | null => {
    let cur: Element | null = node;
    while (cur && cur !== root) {
      if (cur instanceof HTMLElement) {
        const axis = axisAt(cur, x, y);
        if (axis) return { el: cur, axis };
      }
      cur = cur.parentElement;
    }
    return null;
  };

  const metrics = (el: HTMLElement, axis: "x" | "y"): Box | null => {
    if (!el.isConnected) return null;
    const vert = axis === "y";
    const view = vert ? el.clientHeight : el.clientWidth;
    const total = vert ? el.scrollHeight : el.scrollWidth;
    const max = total - view;
    if (max <= 1 || view <= 0) return null;
    const er = el.getBoundingClientRect();
    const rr = root.getBoundingClientRect();
    const scaleX = root.offsetWidth ? rr.width / root.offsetWidth : 1;
    const scaleY = root.offsetHeight ? rr.height / root.offsetHeight : 1;
    const cs = getComputedStyle(el);
    const track = px("--sb-track", 12);
    const thick = px("--sb-thumb", 10);
    const minThumb = Math.min(view, px("--h-ctl", MIN_THUMB));
    const along = Math.min(view, Math.max(minThumb, (view / total) * view));
    const travel = view - along;
    const scroll = vert ? el.scrollTop : el.scrollLeft;
    const originX = (er.left - rr.left) / scaleX;
    const originY = (er.top - rr.top) / scaleY;
    const bL = parseFloat(cs.borderLeftWidth) || 0;
    const bT = parseFloat(cs.borderTopWidth) || 0;
    const inset = (track - thick) / 2;
    const alongPos = travel <= 0 ? 0 : (scroll / max) * travel;
    if (vert) {
      const x = cs.direction === "rtl" ? bL + inset : bL + el.clientWidth - track + inset;
      return { left: originX + x, top: originY + bT + alongPos, width: thick, height: along, travel, max, view };
    }
    return { left: originX + bL + alongPos, top: originY + bT + el.clientHeight - track + inset, width: along, height: thick, travel, max, view };
  };

  const place = (el: HTMLElement, axis: "x" | "y") => {
    const box = metrics(el, axis);
    if (!box) {
      hide();
      return;
    }
    if (hot && (hot.el !== el || hot.axis !== axis)) hot.el.classList.remove("wb-sb", "wb-sb-x", "wb-sb-y");
    el.classList.add("wb-sb", axis === "y" ? "wb-sb-y" : "wb-sb-x");
    el.classList.remove(axis === "y" ? "wb-sb-x" : "wb-sb-y");
    hot = { el, axis };
    thumb.classList.add("on");
    thumb.style.left = box.left + "px";
    thumb.style.top = box.top + "px";
    thumb.style.width = box.width + "px";
    thumb.style.height = box.height + "px";
    thumb.style.setProperty("--wb-sb-fg", getComputedStyle(el).color);
  };

  const owned = (node: EventTarget | null): Element | null => {
    if (!(node instanceof Element)) return null;
    if (node.closest(".wb-root") !== root || node === root) return null;
    return node;
  };

  const onMove = (e: PointerEvent) => {
    if (drag) {
      const delta = (drag.axis === "y" ? e.clientY : e.clientX) - drag.start;
      const span = drag.travel > 0 ? drag.travel : Math.max(1, drag.view);
      const next = Math.max(0, Math.min(drag.max, drag.scroll + (delta / drag.scale) * (drag.max / span)));
      if (drag.axis === "y") drag.el.scrollTop = next;
      else drag.el.scrollLeft = next;
      place(drag.el, drag.axis);
      return;
    }
    const node = owned(e.target);
    if (!node) {
      if (e.target instanceof Element && e.target.closest(".wb-root") !== root) hide();
      return;
    }
    const hit = find(node, e.clientX, e.clientY);
    if (!hit) hide();
    else place(hit.el, hit.axis);
  };

  const onDown = (e: PointerEvent) => {
    if (e.button !== 0 || drag) return;
    const node = owned(e.target);
    if (!node) return;
    const hit = find(node, e.clientX, e.clientY);
    if (!hit) return;
    const box = metrics(hit.el, hit.axis);
    if (!box) return;
    const rr = root.getBoundingClientRect();
    const scaleX = root.offsetWidth ? rr.width / root.offsetWidth : 1;
    const scaleY = root.offsetHeight ? rr.height / root.offsetHeight : 1;
    const lx = (e.clientX - rr.left) / scaleX;
    const ly = (e.clientY - rr.top) / scaleY;
    const onThumb = lx >= box.left && lx <= box.left + box.width && ly >= box.top && ly <= box.top + box.height;
    if (!onThumb) return;
    place(hit.el, hit.axis);
    drag = {
      el: hit.el,
      axis: hit.axis,
      start: hit.axis === "y" ? e.clientY : e.clientX,
      scroll: hit.axis === "y" ? hit.el.scrollTop : hit.el.scrollLeft,
      travel: box.travel,
      max: box.max,
      scale: hit.axis === "y" ? scaleY : scaleX,
      view: box.view
    };
    eatClick = true;
    root.setPointerCapture(e.pointerId);
    e.preventDefault();
    e.stopPropagation();
  };

  const onUp = (e: PointerEvent) => {
    if (!drag) return;
    drag = null;
    if (root.hasPointerCapture(e.pointerId)) root.releasePointerCapture(e.pointerId);
    const hit = document.elementFromPoint(e.clientX, e.clientY);
    if (!(hit instanceof Element) || hit.closest(".wb-root") !== root) {
      hide();
      return;
    }
    const track = find(hit, e.clientX, e.clientY);
    if (!track) hide();
    else place(track.el, track.axis);
  };

  const onScroll = () => {
    const cur = drag ?? hot;
    if (!cur) return;
    if (!cur.el.isConnected) {
      hide();
      return;
    }
    place(cur.el, cur.axis);
  };

  const onClick = (e: MouseEvent) => {
    if (!eatClick) return;
    eatClick = false;
    e.preventDefault();
    e.stopPropagation();
  };

  const onLeave = () => {
    if (!drag) hide();
  };

  root.addEventListener("pointermove", onMove, true);
  root.addEventListener("pointerdown", onDown, true);
  root.addEventListener("pointerup", onUp, true);
  root.addEventListener("pointercancel", onUp, true);
  root.addEventListener("scroll", onScroll, true);
  root.addEventListener("click", onClick, true);
  root.addEventListener("pointerleave", onLeave);
  return () => {
    root.removeEventListener("pointermove", onMove, true);
    root.removeEventListener("pointerdown", onDown, true);
    root.removeEventListener("pointerup", onUp, true);
    root.removeEventListener("pointercancel", onUp, true);
    root.removeEventListener("scroll", onScroll, true);
    root.removeEventListener("click", onClick, true);
    root.removeEventListener("pointerleave", onLeave);
    hide();
    thumb.remove();
  };
}
