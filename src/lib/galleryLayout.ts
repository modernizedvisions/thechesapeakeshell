export type GallerySize = 'lg' | 'wide' | 'tall' | 'sm';

export function getGallerySize(index: number): GallerySize {
  switch (index % 10) {
    case 0:
      return 'lg';
    case 1:
      return 'tall';
    case 2:
      return 'sm';
    case 3:
      return 'wide';
    case 4:
      return 'sm';
    case 5:
      return 'tall';
    case 6:
      return 'sm';
    case 7:
      return 'wide';
    case 8:
      return 'sm';
    default:
      return 'sm';
  }
}
