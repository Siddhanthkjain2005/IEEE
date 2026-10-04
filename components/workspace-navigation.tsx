"use client";

import { ArrowUpRight, Backpack, Box, ChartNoAxesCombined, ClipboardCheck, Compass, FlaskConical, Leaf, Plus, Waves } from "lucide-react";
import { TabsList, TabsTrigger } from "./ui/tabs";

const destinations = [
  { id: "overview", label: "Overview", subtitle: "The evidence workspace", icon: Compass },
  { id: "observe", label: "Field notebook", subtitle: "Capture an observation", icon: Leaf },
  { id: "review", label: "Review desk", subtitle: "Follow the evidence", icon: ClipboardCheck },
  { id: "lab", label: "Evidence lab", subtitle: "Inspect every decision", icon: FlaskConical },
  { id: "insights", label: "Insights", subtitle: "Understand your collection", icon: ChartNoAxesCombined },
  { id: "twins", label: "3D River twins", subtitle: "Explore real geography", icon: Box },
  { id: "kit", label: "Field kit", subtitle: "Sources, guidance & exports", icon: Backpack },
] as const;

export function WorkspaceNavigation({ active, awaiting, online, presentation, onNavigate, onNew }: {
  active: string; awaiting: number; online: boolean; presentation: boolean;
  onNavigate: (destination: string) => void; onNew: () => void;
}) {
  const current = destinations.find((item) => item.id === active);
  return <>
    <aside className="journal-sidebar" aria-label="Workspace navigation">
      <button type="button" className="journal-brand" onClick={() => onNavigate("overview")} aria-label="AquaLens overview">
        <span className="journal-brand-icon"><Waves size={24} strokeWidth={1.5} /></span>
        <span>AquaLens<small>A RIVER FIELD JOURNAL</small></span>
      </button>
      <div className="journal-nav-heading"><span>WORKSPACE</span><span>01—07</span></div>
      <TabsList className="journal-navigation" aria-label="Evidence workspace sections" variant="line">
        {destinations.map(({ id, label, icon: Icon }, index) => <TabsTrigger key={id} value={id} title={label}>
          <Icon size={18} strokeWidth={1.6} /><span>{label}</span>
          {id === "review" && awaiting > 0 ? <b className="journal-nav-count">{awaiting}</b> : <small className="journal-nav-number">0{index + 1}</small>}
        </TabsTrigger>)}
      </TabsList>
      <div className="journal-sidebar-bottom">
        <a className="journal-archive-link" href={presentation ? "/visuals?collection=showcase" : "/visuals"}>
          <span className="journal-mini-river" aria-hidden="true"><svg viewBox="0 0 170 66"><path d="M-10 17 C35 67 42 -4 91 23 S130 86 185 34 M-10 27 C35 77 42 6 91 33 S130 96 185 44 M-10 7 C35 57 42 -14 91 13 S130 76 185 24" /></svg></span>
          <span>THE VISUAL OBSERVATORY</span><strong>A different<br /><em>point of view.</em></strong><span>Explore the river archive <ArrowUpRight size={15} /></span>
        </a>
        <a className="journal-collection-link" href={presentation ? "/" : "/showcase"}>{presentation ? "My observations" : "Presentation collection"}<ArrowUpRight size={14} /></a>
        <p className="journal-sidebar-note"><span className="journal-status-dot" />{presentation ? "Separate example collection" : "Saved in this browser"}<small>Evidence first. Human judgment always.</small></p>
      </div>
    </aside>
    <header className="journal-topbar">
      <div className="journal-breadcrumb"><span>{presentation ? "Presentation collection" : "Your workspace"}</span><i>/</i><strong>{current?.label || "River schematic"}</strong></div>
      <div className="journal-topbar-actions"><span className="journal-network"><i className={online ? "is-online" : ""} />{online ? "Local workspace" : "Offline workspace"}</span><a className="journal-archive-compact" href={presentation ? "/visuals?collection=showcase" : "/visuals"} aria-label="Open Visual observatory" title="Visual observatory"><ChartNoAxesCombined size={18} /><span>Visual archive</span></a><button type="button" className="btn primary" onClick={onNew}><Plus size={16} /><span>New observation</span></button></div>
    </header>
  </>;
}
