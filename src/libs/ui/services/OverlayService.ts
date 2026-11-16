interface OverlayEntry {
  panel: HTMLElement;
  dismiss: () => void;
  canEscape: () => boolean;
  returnFocus: HTMLElement | null;
}

function activeElement(doc: Document): HTMLElement | null {
  const element = doc.activeElement;
  return element && "focus" in element ? (element as HTMLElement) : null;
}
function focusTargets(panel: HTMLElement): HTMLElement[] {
  const view = panel.ownerDocument.defaultView;
  return Array.from(
    panel.querySelectorAll<HTMLElement>(
      "button, input, textarea, select, a[href], [tabindex], [contenteditable=true]",
    ),
  ).filter((element) => {
    if (
      element.tabIndex < 0 ||
      element.matches(':disabled, input[type="hidden"]') ||
      element.closest('[hidden], [inert], [aria-hidden="true"]')
    )
      return false;
    for (
      let parent: HTMLElement | null = element;
      parent;
      parent = parent.parentElement
    ) {
      const style = view?.getComputedStyle(parent);
      if (style?.display === "none" || style?.visibility === "hidden")
        return false;
      if (parent === panel) break;
    }
    return true;
  });
}
function focusPanel(entry: OverlayEntry): void {
  (focusTargets(entry.panel)[0] ?? entry.panel).focus();
}

/** One pair of document listeners serves every open Haruna overlay. */
class OverlayStack {
  private readonly entries: OverlayEntry[] = [];
  private readonly overflow: string;
  private readonly originalFocus: HTMLElement | null;
  constructor(private readonly doc: Document) {
    this.overflow = doc.body.style.overflow;
    this.originalFocus = activeElement(doc);
  }
  get top(): OverlayEntry | undefined {
    return this.entries[this.entries.length - 1];
  }

  add(entry: OverlayEntry): void {
    if (this.entries.length === 0) {
      this.doc.body.style.overflow = "hidden";
      this.doc.addEventListener("keydown", this.keydown);
      this.doc.addEventListener("focusin", this.focusin);
    }
    this.entries.push(entry);
    focusPanel(entry);
  }
  remove(entry: OverlayEntry): void {
    const wasTop = entry === this.top;
    const index = this.entries.indexOf(entry);
    if (index === -1) return;
    this.entries.splice(index, 1);
    if (!this.top) {
      this.doc.removeEventListener("keydown", this.keydown);
      this.doc.removeEventListener("focusin", this.focusin);
      this.doc.body.style.overflow = this.overflow;
      STACKS.delete(this.doc);
    }
    if (!wasTop) return;
    const target = entry.returnFocus?.isConnected
      ? entry.returnFocus
      : this.originalFocus;
    if (target?.isConnected && (!this.top || this.top.panel.contains(target)))
      target.focus();
    else if (this.top) focusPanel(this.top);
  }
  private readonly focusin = (event: FocusEvent): void => {
    const entry = this.top;
    if (entry && !entry.panel.contains(event.target as Node)) focusPanel(entry);
  };
  private readonly keydown = (event: KeyboardEvent): void => {
    const entry = this.top;
    if (!entry || event.defaultPrevented) return;
    if (event.key === "Escape") {
      if (entry.canEscape()) {
        event.preventDefault();
        event.stopPropagation();
        entry.dismiss();
      }
      return;
    }
    if (event.key !== "Tab") return;
    const targets = focusTargets(entry.panel);
    const current = this.doc.activeElement;
    const index = targets.findIndex((target) => target === current);
    const atBoundary = event.shiftKey
      ? index <= 0
      : index === -1 || index === targets.length - 1;
    if (atBoundary) {
      event.preventDefault();
      (event.shiftKey
        ? (targets[targets.length - 1] ?? entry.panel)
        : (targets[0] ?? entry.panel)
      ).focus();
    }
  };
}
const STACKS = new WeakMap<Document, OverlayStack>();

export class OverlayService {
  private entry?: OverlayEntry;
  private stack?: OverlayStack;
  constructor(
    private readonly element: HTMLElement,
    private readonly dismiss: () => void,
    private readonly canEscape: () => boolean,
  ) {}
  get isTop(): boolean {
    return Boolean(this.entry && this.stack?.top === this.entry);
  }
  open(): void {
    if (this.entry) return;
    const doc = this.element.ownerDocument;
    const stack = STACKS.get(doc) ?? new OverlayStack(doc);
    STACKS.set(doc, stack);
    this.stack = stack;
    this.entry = {
      panel: this.element,
      dismiss: this.dismiss,
      canEscape: this.canEscape,
      returnFocus: activeElement(doc),
    };
    stack.add(this.entry);
  }
  close(): void {
    if (this.entry) this.stack?.remove(this.entry);
    this.entry = undefined;
    this.stack = undefined;
  }
}
