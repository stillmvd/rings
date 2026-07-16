import { useRef, useState } from "react";
import { Reorder } from "motion/react";
import { ImagePlus, X } from "lucide-react";
import { mediaSrc } from "@/lib/paths";
import { filterAcceptedImages, ACCEPTED_IMAGE_TYPES } from "@/lib/media";
import { Lightbox } from "@/components/ui/Lightbox";
import type { EventMedia } from "@/db/queries/media";

export type MediaItem =
  | { key: string; kind: "existing"; media: EventMedia }
  | { key: string; kind: "pending"; file: File; url: string };

export function mediaItemSrc(item: MediaItem): string {
  return item.kind === "existing" ? mediaSrc(item.media.path) : item.url;
}

export { filterAcceptedImages };

export function MediaUploader({
  items,
  onReorder,
  onPick,
  onRemove,
}: {
  items: MediaItem[];
  onReorder: (items: MediaItem[]) => void;
  onPick: (files: File[]) => void;
  onRemove: (item: MediaItem) => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const images = items.map((it) => ({ key: it.key, src: mediaItemSrc(it) }));

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const files = filterAcceptedImages(e.dataTransfer.files);
    if (files.length) onPick(files);
  }

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs font-medium text-muted">Фотографии</span>

      {items.length > 0 && (
        <Reorder.Group axis="x" values={items} onReorder={onReorder} className="flex flex-wrap gap-2">
          {items.map((item, i) => (
            <Reorder.Item
              key={item.key}
              value={item}
              onClick={() => setLightbox(i)}
              className="group relative h-16 w-16 cursor-grab overflow-hidden rounded-lg border border-line bg-surface-0 active:cursor-grabbing"
            >
              <img
                src={mediaItemSrc(item)}
                alt=""
                draggable={false}
                className="pointer-events-none h-full w-full object-cover"
              />
              <button
                type="button"
                aria-label="Удалить фото"
                onPointerDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(item);
                }}
                className="absolute right-0.5 top-0.5 grid h-5 w-5 cursor-pointer place-items-center rounded-md bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                <X size={12} />
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      )}

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setDragOver(true);
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        className={`flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed py-3 text-xs transition-colors ${
          dragOver
            ? "border-amber bg-amber/10 text-app-text"
            : "border-line text-muted hover:border-amber hover:text-app-text"
        }`}
      >
        <ImagePlus size={15} />
        Перетащите, вставьте (Ctrl+V) или нажмите
      </button>

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_TYPES.join(",")}
        multiple
        className="hidden"
        onChange={(e) => {
          const files = filterAcceptedImages(e.target.files ?? []);
          if (files.length) onPick(files);
          e.target.value = "";
        }}
      />

      <Lightbox
        open={lightbox !== null}
        images={images}
        index={lightbox ?? 0}
        onIndexChange={setLightbox}
        onClose={() => setLightbox(null)}
      />
    </div>
  );
}
