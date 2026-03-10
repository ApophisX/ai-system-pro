import type { Slide, SlideImage, SlideVideo } from 'yet-another-react-lightbox';

import { useState, useCallback } from 'react';

// ----------------------------------------------------------------------

export type UseLightboxReturn = {
  open: boolean;
  selected: number;
  onClose: () => void;
  onOpen: (slideUrl: string) => void;
  setSelected: React.Dispatch<React.SetStateAction<number>>;
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  slides: Slide[];
  onPreviewImages: (images: string[], index: number) => void;
};

export function useLightbox(slides: Slide[]): UseLightboxReturn {
  const [selected, setSelected] = useState(-1);

  const [_slides, setSlides] = useState(slides);

  const handleOpen = useCallback(
    (slideUrl: string) => {
      const slideIndex = _slides.findIndex((slide) =>
        slide.type === 'video'
          ? (slide as SlideVideo).poster === slideUrl
          : (slide as SlideImage).src === slideUrl
      );

      setSelected(slideIndex);
    },
    [_slides]
  );

  const handlePreviewImages = useCallback(
    (images: string[], index: number) => {
      setSlides(
        images.map((image) => ({
          type: 'image',
          src: image,
        }))
      );
      setSelected(index);
    },
    [setSlides]
  );

  const handleClose = useCallback(() => {
    setSelected(-1);
  }, []);

  return {
    selected,
    open: selected >= 0,
    onOpen: handleOpen,
    onClose: handleClose,
    setSelected,
    setSlides,
    slides: _slides,
    onPreviewImages: handlePreviewImages,
  };
}
