import ShoppingBag from "@/modules/common/icons/shopping-bag"

export default function SkeletonCartButton() {
  return (
    <button className="transition-fg relative inline-flex w-fit items-center justify-center overflow-hidden outline-none txt-compact-small-plus gap-x-1.5 px-3 py-1.5 rounded-full hover:bg-neutral-100">
      <ShoppingBag />
      <span className="text-sm font-normal hidden small:inline-block">
        Cart
      </span>
      <div className="bg-blue-500 text-white text-xs px-1.5 py-px rounded-full">
        0
      </div>
    </button>
  )
}
