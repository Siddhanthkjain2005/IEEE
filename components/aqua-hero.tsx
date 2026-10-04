"use client";

import { useEffect, useRef, useState } from "react";
import { animate } from "motion/mini";
import { ArrowUpRight, Camera, CircleHelp, Eye, Pause, Play, RotateCcw, UsersRound } from "lucide-react";
import type { createAquaScene, RiverView } from "@/lib/aqua-scene";

const stages = [
  { name: "Observe", icon: Eye, title: "Begin with what you see.", text: "A photo. A place. Your own words. The original observation stays yours." },
  { name: "Question", icon: CircleHelp, title: "Make room for the unknown.", text: "Explore missing context and optional AI suggestions. You decide what to accept." },
  { name: "Review", icon: UsersRound, title: "Bring a human perspective.", text: "Follow the evidence, retain uncertainty, and leave a clear trail for a reviewer." },
];

/** A deliberately illustrative river section, with no geographic or environmental data. */
function RiverDrawing() {
  return <svg viewBox="0 0 580 430" fill="none" className="river-fallback" aria-hidden="true">
    <defs>
      <linearGradient id="river-paper" x1="120" y1="100" x2="440" y2="330" gradientUnits="userSpaceOnUse"><stop stopColor="#cbd1b7" /><stop offset="1" stopColor="#91a489" /></linearGradient>
      <linearGradient id="river-water" x1="180" y1="80" x2="360" y2="340" gradientUnits="userSpaceOnUse"><stop stopColor="#426c61" /><stop offset=".55" stopColor="#83a89a" /><stop offset="1" stopColor="#315d53" /></linearGradient>
    </defs>
    <g transform="translate(0 8)">
      <path d="M65 248 251 111Q266 102 280 110L517 240V265Q517 274 507 282L319 399Q302 409 288 401L78 279Q65 271 65 260Z" fill="#c2b897" />
      <path d="M65 238 251 101Q266 92 280 100L517 230V250Q517 259 507 267L319 384Q302 394 288 386L78 264Q65 256 65 245Z" fill="#ded4b7" />
      <path d="M65 230 251 93Q266 84 280 92L509 222Q525 231 508 242L319 368Q304 378 289 369L78 246Q64 239 65 230Z" fill="url(#river-paper)" />
      <path d="M237 106C275 129 340 128 337 160S250 185 256 221 355 250 358 282 329 326 322 365L282 365C287 330 320 312 310 287S207 257 210 221 296 184 289 161 236 145 205 128Z" fill="url(#river-water)" />
      <path d="M230 115C268 138 319 133 317 160S228 191 234 222 334 256 336 283 307 332 304 369" stroke="#cadfd0" strokeOpacity=".52" strokeWidth="1.5" />
      <path d="M197 133C225 153 276 148 272 164S191 194 193 222 251 268 274 278 286 314 267 344M180 145C209 165 250 158 251 167S172 197 174 226 230 277 256 288 265 316 249 334M161 158C191 178 212 165 227 174S151 199 156 231 212 285 237 298L231 324M144 171C167 187 188 184 192 190S130 206 139 236 184 280 215 306" stroke="#647c5e" strokeOpacity=".65" strokeWidth="1.2" />
      <path d="M255 97C289 114 367 126 356 162S277 190 277 218 377 245 379 284 350 335 345 350M279 104C323 124 392 132 378 168S297 195 299 216 401 247 400 288 378 321 365 337M310 120C355 138 409 145 398 175S322 199 323 216 420 251 420 289L387 323M342 139C384 151 435 161 417 183S345 201 347 216 442 251 441 286L410 310" stroke="#647c5e" strokeOpacity=".6" strokeWidth="1.2" />
      <path d="M65 247 290 379Q305 389 320 379L517 251M65 261 290 393Q305 403 320 393L514 266" stroke="#9b9274" strokeOpacity=".5" />
      <g><path d="M278 181V139" stroke="#8b6c35" strokeWidth="2" /><circle cx="278" cy="137" r="12" fill="#f7f3e6" stroke="#af9358" /><circle cx="278" cy="137" r="4" fill="#ae9053" /></g>
      <g><path d="M212 263V223" stroke="#6c7d66" strokeWidth="1.5" /><circle cx="212" cy="221" r="8" fill="#f7f3e6" stroke="#71816b" /><circle cx="212" cy="221" r="2" fill="#71816b" /></g>
      <g><path d="M383 278V238" stroke="#6c7d66" strokeWidth="1.5" /><circle cx="383" cy="236" r="8" fill="#f7f3e6" stroke="#71816b" /><circle cx="383" cy="236" r="2" fill="#71816b" /></g>
    </g>
  </svg>;
}

export function AquaHero({ online, onStart, onInsights }: { online: boolean; onStart: () => void; onInsights: () => void }) {
  const host = useRef<HTMLDivElement>(null);
  const copy = useRef<HTMLDivElement>(null);
  const controller = useRef<ReturnType<typeof createAquaScene> | null>(null);
  const [scene, setScene] = useState<"static" | "ready" | "unavailable">("static");
  const [paused, setPaused] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [stage, setStage] = useState(0);
  const [angle, setAngle] = useState(0);
  const [view, setView] = useState<RiverView>("perspective");
  const pose = useRef({ angle: 0, view: "perspective" as RiverView });
  const motionAllowed = useRef(false);
  const visible = useRef(false);
  const stageRef = useRef(0);
  useEffect(() => {
    const preference = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(preference.matches);
    update(); preference.addEventListener("change", update);
    return () => preference.removeEventListener("change", update);
  }, []);
  useEffect(() => {
    motionAllowed.current = !paused && !reduced;
    controller.current?.setRunning(motionAllowed.current && visible.current && !document.hidden);
  }, [paused, reduced]);
  useEffect(() => {
    stageRef.current = stage;
    controller.current?.setStage(stage);
  }, [stage]);
  useEffect(() => {
    pose.current.angle = angle;
    controller.current?.setRotation(angle);
  }, [angle]);
  useEffect(() => {
    pose.current.view = view;
    controller.current?.setView(view);
  }, [view]);
  useEffect(() => {
    if (!copy.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Content is present before animation and remains usable without the scene.
    const controls = animate(copy.current, { opacity: [0.65, 1], transform: ["translateY(9px)", "translateY(0px)"] }, { duration: 0.7, ease: [0.2, 0.65, 0.2, 1] });
    return () => controls.stop();
  }, []);
  useEffect(() => {
    const element = host.current;
    if (!element) return;
    let disposed = false, loading = false;
    const sync = () => controller.current?.setRunning(motionAllowed.current && visible.current && !document.hidden);
    const load = async () => {
      if (loading || disposed) return;
      loading = true;
      try {
        const { createAquaScene } = await import("@/lib/aqua-scene");
        if (disposed) return;
        let failed = false;
        controller.current = createAquaScene(element, () => { failed = true; if (!disposed) setScene("unavailable"); }, setAngle);
        if (!failed) { controller.current.setStage(stageRef.current); controller.current.setRotation(pose.current.angle); controller.current.setView(pose.current.view); setScene("ready"); }
        sync();
      } catch {
        if (!disposed) { controller.current?.dispose(); controller.current = null; setScene("unavailable"); }
      }
    };
    const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver(([entry]) => {
      visible.current = entry.isIntersecting;
      if (entry.isIntersecting) void load();
      sync();
    }, { threshold: 0.05 });
    if (observer) observer.observe(element);
    document.addEventListener("visibilitychange", sync);
    return () => { disposed = true; observer?.disconnect(); document.removeEventListener("visibilitychange", sync); controller.current?.dispose(); controller.current = null; };
  }, []);

  const ActiveIcon = stages[stage].icon;
  return <header className="river-hero" data-motion={paused || reduced ? "still" : "flowing"}>
    <div className="river-hero-copy" ref={copy}>
      <div className="river-eyebrow"><span className="river-edition-mark" aria-hidden="true">≈</span> NOTES FROM THE WATER’S EDGE</div>
      <h1>Every river<br />has a <em>story.</em></h1>
      <p>A closer look is where understanding begins. Gather what you see, keep the context, and let the evidence lead.</p>
      <div className="river-hero-actions">
        <button type="button" className="river-start" onClick={onStart}><Camera size={16} /> New observation <ArrowUpRight size={17} /></button>
        <button type="button" className="river-explore" onClick={onInsights}>Explore river insights <ArrowUpRight size={15} /></button>
      </div>
      <div className="river-workspace-note"><span className="river-status-dot" /><span>{online ? "Your local field workspace" : "Your offline field workspace"}</span><span className="river-note-separator" aria-hidden="true">/</span><span>Human judgment, always.</span></div>
    </div>
    <div className={`river-specimen${scene === "ready" ? " is-three-dimensional" : ""}`}>
      <div className="river-specimen-heading"><span>THE ART OF PAYING ATTENTION</span><span className="river-specimen-number" aria-hidden="true">Fig. 01</span></div>
      <div className="river-artwork">
        <div className="river-artwork-contours" aria-hidden="true" />
        <RiverDrawing />
        <div className="river-scene" ref={host} aria-hidden="true" />
        <span className="river-artwork-caption">Conceptual river study · not a mapped location</span>
        {scene === "ready" && !reduced && <button className="river-motion-control" type="button" onClick={() => setPaused(!paused)} aria-pressed={paused} aria-label={paused ? "Play decorative motion" : "Pause decorative motion"}>{paused ? <Play size={12} /> : <Pause size={12} />}<span>{paused ? "Play" : "Pause"}</span></button>}
        {reduced && <span className="river-still-label">Still view</span>}
      </div>
      {scene === "ready" && <div className="river-scene-tools">
        <div className="river-view-buttons" role="group" aria-label="3D river perspective">
          {([{ id: "perspective", label: "Perspective" }, { id: "overhead", label: "From above" }, { id: "layers", label: "Illustrative layers" }] as const).map((item) => <button type="button" key={item.id} aria-pressed={view === item.id} onClick={() => setView(item.id)}>{item.label}</button>)}
        </div>
        <div className="river-rotation"><label htmlFor="river-study-angle">Rotate study</label><input id="river-study-angle" type="range" min={-180} max={180} step={1} value={angle} aria-label="Rotate 3D river study" aria-valuetext={`${angle} degrees`} onChange={(event) => setAngle(Number(event.target.value))} /><button type="button" aria-label="Reset 3D river view" onClick={() => { setAngle(0); setView("perspective"); }}><RotateCcw size={15} /></button></div>
        <p>{view === "layers" ? "Authored illustration layers · no geological data" : "Drag to rotate · or use the rotation slider"}</p>
      </div>}
      <div className="river-workflow">
        <div className="river-stage-buttons" role="group" aria-label="Explore the evidence workflow">
          {stages.map((item, index) => <button key={item.name} type="button" aria-pressed={stage === index} onClick={() => setStage(index)}><span>0{index + 1}</span>{item.name}<ArrowUpRight size={13} /></button>)}
        </div>
        <div className="river-stage-description" aria-live="polite"><ActiveIcon size={21} strokeWidth={1.5} /><div><strong>{stages[stage].title}</strong><p>{stages[stage].text}</p></div></div>
      </div>
    </div>
  </header>;
}
