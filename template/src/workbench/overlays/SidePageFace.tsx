import { useState } from "react";
import type { SidePageDef, SidePageItem, SidePageRegion } from "../types";

type Zone = "top" | "start" | "stage" | "end" | "bottom";

function tabChoices(region: SidePageRegion): SidePageItem[] {
  return region.items.filter((item) => !item.group);
}

function currentTab(region: SidePageRegion, picked: Record<string, string>): string {
  return picked[region.id] ?? tabChoices(region)[0]?.label ?? "";
}

function shown(page: SidePageDef, picked: Record<string, string>): SidePageRegion[] {
  return page.regions.filter((region) => {
    if (!region.tab) return true;
    const owner = page.regions.find((r) => r.present === "tabs" && tabChoices(r).some((item) => item.label === region.tab));
    if (!owner) return true;
    return currentTab(owner, picked) === region.tab;
  });
}

function zoneOf(region: SidePageRegion): Zone {
  if (region.present === "status" || region.edge === "bottom") return "bottom";
  if (region.present === "aside") return region.place === "end" ? "end" : "start";
  if (region.present === "tabs" && region.place) return region.place === "end" ? "end" : "start";
  if (region.present === "list" && region.tab) return region.place === "end" ? "end" : "start";
  if (region.present === "canvas" || region.present === "paper" || region.present === "grid" || region.present === "list") return "stage";
  return "top";
}

function Buttons({ items }: { items: SidePageItem[] }) {
  return (
    <>
      {items.map((item) => (
        <span key={item.id} className="wb-sp-btn">
          {item.label}
        </span>
      ))}
    </>
  );
}

function Ribbon({ region }: { region: SidePageRegion }) {
  const grouped = region.items.some((item) => item.group);
  if (!grouped) {
    return (
      <div className="wb-sp-ribbon" data-region={region.id}>
        <Buttons items={region.items} />
      </div>
    );
  }
  const groups: { title: string; items: SidePageItem[] }[] = [];
  for (const item of region.items) {
    const title = item.group ?? "";
    const last = groups[groups.length - 1];
    if (last && last.title === title) last.items.push(item);
    else groups.push({ title, items: [item] });
  }
  return (
    <div className="wb-sp-ribbon" data-region={region.id}>
      {groups.map((group) => (
        <div key={group.title || "all"} className="wb-sp-group">
          <div className="wb-sp-tools">
            <Buttons items={group.items} />
          </div>
          {group.title ? <div className="wb-sp-glabel">{group.title}</div> : null}
        </div>
      ))}
    </div>
  );
}

function Tabs({ region, current, onPick }: { region: SidePageRegion; current: string; onPick: (label: string) => void }) {
  const tabs = tabChoices(region);
  const end = region.items.filter((item) => item.group);
  return (
    <div className={"wb-sp-tabs" + (region.place ? " in-col" : "")} data-region={region.id}>
      {tabs.map((item) => (
        <button key={item.id} type="button" className={item.label === current ? "on" : ""} onClick={() => onPick(item.label)}>
          {item.label}
        </button>
      ))}
      {end.length > 0 && (
        <span className="wb-sp-tabs-end">
          <Buttons items={end} />
        </span>
      )}
    </div>
  );
}

function Block({ region, picked, onPick }: { region: SidePageRegion; picked: Record<string, string>; onPick: (id: string, label: string) => void }) {
  if (region.present === "ribbon") return <Ribbon region={region} />;
  if (region.present === "swatches") {
    return (
      <div className="wb-sp-swatches" data-region={region.id}>
        <Buttons items={region.items} />
      </div>
    );
  }
  if (region.present === "tabs") return <Tabs region={region} current={currentTab(region, picked)} onPick={(label) => onPick(region.id, label)} />;
  if (region.present === "search") {
    return (
      <div className="wb-sp-search" data-region={region.id}>
        <input className="wb-input" readOnly placeholder={region.items[0]?.label ?? region.title} aria-label={region.title} />
      </div>
    );
  }
  if (region.present === "list" || region.present === "aside") {
    return (
      <section className={region.present === "aside" ? "wb-sp-aside" : "wb-sp-list"} data-region={region.id}>
        <h3>{region.title}</h3>
        {region.items.map((item) => (
          <div key={item.id} className="wb-sp-row">
            {item.label}
          </div>
        ))}
      </section>
    );
  }
  if (region.present === "canvas") {
    return (
      <div className="wb-sp-canvas" data-region={region.id}>
        {region.items.length > 0 && (
          <div className="wb-sp-corners">
            <Buttons items={region.items} />
          </div>
        )}
      </div>
    );
  }
  if (region.present === "paper") {
    return (
      <div className="wb-sp-sheet-wrap" data-region={region.id}>
        <div className="wb-sp-sheet">{region.title}</div>
      </div>
    );
  }
  if (region.present === "grid") {
    return (
      <div className="wb-sp-grid" data-region={region.id} aria-label={region.title}>
        {Array.from({ length: 48 }, (_, i) => (
          <i key={i} />
        ))}
      </div>
    );
  }
  return (
    <div className="wb-sp-status" data-region={region.id}>
      <Buttons items={region.items} />
    </div>
  );
}

/** 编辑区里的副页面：按软件窗口的位置摆分区，不跑真实作图或图片引擎。 */
export function SidePageFace({ page }: { page: SidePageDef }) {
  const [picked, setPicked] = useState<Record<string, string>>({});
  const regions = shown(page, picked);
  const buckets: Record<Zone, SidePageRegion[]> = { top: [], start: [], stage: [], end: [], bottom: [] };
  for (const region of regions) buckets[zoneOf(region)].push(region);
  const draw = (region: SidePageRegion) => (
    <Block key={region.id} region={region} picked={picked} onPick={(id, label) => setPicked((cur) => ({ ...cur, [id]: label }))} />
  );
  return (
    <div className="wb-sidepage" aria-label={page.title}>
      {buckets.top.length > 0 && <div className="wb-sp-top">{buckets.top.map(draw)}</div>}
      {(buckets.start.length > 0 || buckets.stage.length > 0 || buckets.end.length > 0) && (
        <div className="wb-sp-body">
          {buckets.start.length > 0 && <div className="wb-sp-col">{buckets.start.map(draw)}</div>}
          {buckets.stage.length > 0 && <div className="wb-sp-stage">{buckets.stage.map(draw)}</div>}
          {buckets.end.length > 0 && <div className="wb-sp-col end">{buckets.end.map(draw)}</div>}
        </div>
      )}
      {buckets.bottom.length > 0 && <div className="wb-sp-bottom">{buckets.bottom.map(draw)}</div>}
    </div>
  );
}
