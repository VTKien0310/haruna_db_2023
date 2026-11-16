import {
  autoUpdate,
  computePosition,
  flip,
  offset,
  shift,
  size,
} from "@floating-ui/vue";

/** Owns positioning observers; the component owns its open/selection state. */
export class DropdownService {
  private cleanup?: () => void;
  private generation = 0;
  open(anchor: HTMLElement, popup: HTMLElement): void {
    this.close();
    const generation = this.generation;
    this.cleanup = autoUpdate(anchor, popup, () => {
      void computePosition(anchor, popup, {
        strategy: "fixed",
        placement: "bottom-start",
        middleware: [
          offset(4),
          flip(),
          shift({ padding: 8 }),
          size({
            padding: 8,
            apply({ rects, availableHeight, elements }) {
              elements.floating.style.width = `${rects.reference.width}px`;
              elements.floating.style.maxHeight = `${Math.max(0, Math.min(256, availableHeight))}px`;
            },
          }),
        ],
      }).then(({ x, y }) => {
        if (generation !== this.generation) return;
        Object.assign(popup.style, { left: `${x}px`, top: `${y}px` });
      });
    });
  }
  close(): void {
    this.generation++;
    this.cleanup?.();
    this.cleanup = undefined;
  }
}
