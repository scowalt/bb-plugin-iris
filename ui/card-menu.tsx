// A card's actions behind one quiet ⋯ button: a labeled menu that opens under it, drawn in a
// portal so a card's own clipping never cuts it. Arrow keys move, Enter or a click runs an item,
// Escape, a click outside, scrolling or resizing closes it and focus returns to the button.
import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { usePortalScopeProps } from "../lib/portal-scope";
import { Glyph, cn } from "./views/kit";

/** id stays the same while the label flips (Pin and Unpin, Show and Hide source), so focus stays on the item. */
export type MenuItem = { id: string; icon: string; label: string; run: () => void; disabled?: boolean } | "separator";

/** Room the menu keeps from the window's edges, in CSS pixels. */
const EDGE = 8;

export function CardMenu({ items, label = "Card actions", busy = false, badge }: { items: MenuItem[]; label?: string; busy?: boolean; badge?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [place, setPlace] = useState<{ top: number; left: number; maxHeight: number } | null>(null);
  const button = useRef<HTMLButtonElement | null>(null);
  const menu = useRef<HTMLDivElement | null>(null);
  const id = useId();
  const scope = usePortalScopeProps();
  // Separators that would lead, trail or double up are dropped.
  const shown = items.filter((it, k, all) => it !== "separator" || (k > 0 && k < all.length - 1 && all[k - 1] !== "separator"));

  // Closing hands focus back to the button whenever focus was in the menu, so it never drops to the page.
  const close = useCallback((refocus = true) => {
    const hadFocus = menu.current?.contains(document.activeElement) ?? false;
    setOpen(false);
    if (refocus || hadFocus) button.current?.focus({ preventScroll: !refocus });
  }, []);

  // Right-aligned under the button, flipped above it when the window has no room below, and kept
  // inside the window (it scrolls when neither side has room).
  const measure = useCallback(() => {
    if (!button.current || !menu.current) return;
    const b = button.current.getBoundingClientRect();
    const m = menu.current.getBoundingClientRect();
    const below = b.bottom + 4;
    const roomBelow = innerHeight - EDGE - below;
    const roomAbove = b.top - 4 - EDGE;
    const up = m.height > roomBelow && roomAbove > roomBelow;
    const height = Math.min(m.height, up ? roomAbove : roomBelow);
    setPlace({ top: up ? b.top - 4 - height : below, left: Math.min(Math.max(EDGE, b.right - m.width), innerWidth - m.width - EDGE), maxHeight: Math.max(120, up ? roomAbove : roomBelow) });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    measure();
    menu.current?.querySelector<HTMLButtonElement>("[role=menuitem]:not(:disabled)")?.focus();
  }, [open, measure]);

  useEffect(() => {
    if (!open) return;
    const outside = (e: PointerEvent) => {
      const t = e.target as Node;
      if (!menu.current?.contains(t) && !button.current?.contains(t)) close(false);
    };
    // Only a scroll that moves the button matters (bb's message list following a reply, say): the
    // menu follows it, and closes once the button is out of view.
    const scrolled = (e: Event) => {
      const t = e.target;
      if (!button.current || !(t instanceof Node) || !t.contains(button.current)) return;
      const b = button.current.getBoundingClientRect();
      if (b.bottom < 0 || b.top > innerHeight) close(false);
      else measure();
    };
    const resized = () => close(false);
    addEventListener("pointerdown", outside, true);
    addEventListener("resize", resized);
    addEventListener("scroll", scrolled, true);
    return () => {
      removeEventListener("pointerdown", outside, true);
      removeEventListener("resize", resized);
      removeEventListener("scroll", scrolled, true);
    };
  }, [open, close, measure]);

  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    const all = [...(menu.current?.querySelectorAll<HTMLButtonElement>("[role=menuitem]:not(:disabled)") ?? [])];
    const at = all.indexOf(document.activeElement as HTMLButtonElement);
    const go = (k: number) => all[(k + all.length) % all.length]?.focus();
    if (e.key === "ArrowDown") go(at + 1);
    else if (e.key === "ArrowUp") go(at - 1);
    else if (e.key === "Home") go(0);
    else if (e.key === "End") go(all.length - 1);
    else if (e.key === "Escape") close();
    else if (e.key === "Tab") close(true);
    else return;
    if (e.key !== "Tab") e.preventDefault();
  };

  return (
    <div className="flex shrink-0 items-center gap-1">
      {badge}
      <button
        ref={button}
        type="button"
        onClick={() => (open ? close() : setOpen(true))}
        onKeyDown={(e) => e.key === "ArrowDown" && (e.preventDefault(), setOpen(true))}
        aria-label={label}
        title="More"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        className={cn(
          "iris-hit grid size-7 place-items-center rounded-md text-muted-foreground transition-[opacity,background-color,color] hover:bg-state-hover hover:text-foreground focus-visible:opacity-100",
          open ? "bg-state-active text-foreground opacity-100" : "opacity-60 group-hover/iris:opacity-100",
        )}
      >
        <Glyph name={busy ? "loader-circle" : "ellipsis"} size={16} className={busy ? "animate-spin" : undefined} />
      </button>
      {open
        ? createPortal(
            <div
              {...scope}
              ref={menu}
              id={id}
              role="menu"
              aria-label={label}
              onKeyDown={onKey}
              className="fixed z-[1000] min-w-[13.5rem] rounded-xl bg-popover p-1 text-[13px] text-popover-foreground shadow-lg ring-1 ring-border"
              style={place ? { top: place.top, left: place.left, maxHeight: place.maxHeight, overflowY: "auto" } : { top: -9999, left: -9999 }}
            >
              {shown.map((it, k) =>
                it === "separator" ? (
                  <div key={`s${k}`} role="separator" className="mx-2 my-1 h-px bg-border" />
                ) : (
                  <button
                    key={it.id}
                    type="button"
                    role="menuitem"
                    disabled={it.disabled}
                    onClick={() => {
                      close();
                      it.run();
                    }}
                    className="flex h-8 w-full items-center gap-2.5 rounded-lg px-2.5 text-left outline-none [@media(pointer:coarse)]:h-10 [@media(pointer:coarse)]:text-[14.5px] hover:bg-state-hover focus-visible:bg-state-hover disabled:opacity-50"
                  >
                    <Glyph name={it.icon} size={15} className="text-muted-foreground" />
                    <span className="min-w-0 flex-1 truncate">{it.label}</span>
                  </button>
                ),
              )}
            </div>,
            document.body,
          )
        : null}
    </div>
  );
}
