export default function getThumbnailRotation(
  index: number,
  numItems: number
): string {
  if (numItems === 1) {
    return "rotate-0"
  }

  if (numItems === 2) {
    return index === 0 ? "-rotate-2" : "rotate-2"
  }

  if (numItems >= 3) {
    return index === 0 ? "-rotate-2" : index === 1 ? "rotate-0" : "rotate-2"
  }

  return "rotate-0"
}
