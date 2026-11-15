import Image from "next/image";

/**
 * Media half of a hero slide: fills the space above the copy on phones, the right side of the slide from tablet up.
 * Starts below the header, so the header rests on the slide's flat colour (and clears the logo printed on the photos).
 * `children` stand in when there is no photo.
 */
export function SlidePhoto({ src, children }: { src?: string; children?: React.ReactNode }) {
  return (
    <div className="relative mt-[var(--header-h)] min-h-0 flex-1 tab:absolute tab:bottom-0 tab:right-0 tab:top-[var(--header-h)] tab:mt-0 tab:w-[42%] desk:w-[45%]">
      {src ? (
        <>
          <Image src={src} alt="" fill sizes="(min-width: 1040px) 45vw, (min-width: 760px) 42vw, 100vw" className="object-cover object-top tab:object-[center_20%]" />
          {/* Keeps the slideshow controls readable where they sit on the photo */}
          <div aria-hidden className="absolute inset-x-0 bottom-0 hidden h-1/3 bg-gradient-to-t from-acute-ink/60 to-transparent tab:block" />
        </>
      ) : (
        <div className="flex h-full items-center justify-center">{children}</div>
      )}
    </div>
  );
}
