// Adapted from Vuestic's top-modal, focus-trap and scroll-lock behavior.
interface OverlayContext {
  stack: OverlayService[];
  overflow: string;
}
const DOCUMENTS = new WeakMap<Document, OverlayContext>();
const FOCUSABLE =
  'button:not(:disabled), input:not(:disabled), textarea:not(:disabled), select:not(:disabled), a[href], [tabindex]:not([tabindex="-1"])';

export class OverlayService {
  private previousFocus: HTMLElement | null = null;
  private context?: OverlayContext;
  constructor(
    private readonly element: HTMLElement,
    private readonly dismiss: () => void,
    private readonly canEscape: () => boolean,
  ) {}
  get isTop(): boolean {
    return this.context?.stack[this.context.stack.length - 1] === this;
  }
  open(): void {
    if (this.context) return;
    const doc = this.element.ownerDocument;
    const context = DOCUMENTS.get(doc) ?? {
      stack: [],
      overflow: doc.body.style.overflow,
    };
    DOCUMENTS.set(doc, context);
    this.context = context;
    this.previousFocus =
      doc.activeElement instanceof HTMLElement ? doc.activeElement : null;
    context.stack.push(this);
    doc.body.style.overflow = "hidden";
    doc.addEventListener("keydown", this.keydown);
    doc.addEventListener("focusin", this.focusin);
    this.focusFirst();
  }
  private controls(): HTMLElement[] {
    return Array.from(
      this.element.querySelectorAll<HTMLElement>(FOCUSABLE),
    ).filter(
      (element) =>
        !element.closest('[hidden], [inert], [aria-hidden="true"]') &&
        getComputedStyle(element).display !== "none" &&
        getComputedStyle(element).visibility !== "hidden",
    );
  }
  private focusFirst(): void {
    (this.controls()[0] ?? this.element).focus();
  }
  private focusin = (event: FocusEvent): void => {
    if (this.isTop && !this.element.contains(event.target as Node))
      this.focusFirst();
  };
  private keydown = (event: KeyboardEvent): void => {
    if (!this.isTop || event.defaultPrevented) return;
    if (event.key === "Escape" && this.canEscape()) {
      event.preventDefault();
      event.stopPropagation();
      this.dismiss();
    }
    if (event.key !== "Tab") return;
    const controls = this.controls();
    const first = controls[0];
    const last = controls[controls.length - 1];
    if (!first) {
      event.preventDefault();
      this.element.focus();
      return;
    }
    const current = this.element.ownerDocument.activeElement;
    if (event.shiftKey && (current === first || current === this.element)) {
      event.preventDefault();
      last?.focus();
    } else if (
      !event.shiftKey &&
      (current === last || current === this.element)
    ) {
      event.preventDefault();
      first.focus();
    }
  };
  close(): void {
    if (!this.context) return;
    const doc = this.element.ownerDocument;
    const wasTop = this.isTop;
    this.context.stack = this.context.stack.filter(
      (overlay) => overlay !== this,
    );
    doc.removeEventListener("keydown", this.keydown);
    doc.removeEventListener("focusin", this.focusin);
    if (!this.context.stack.length) {
      doc.body.style.overflow = this.context.overflow;
      DOCUMENTS.delete(doc);
    }
    this.context = undefined;
    if (wasTop && this.previousFocus?.isConnected) this.previousFocus.focus();
  }
}
