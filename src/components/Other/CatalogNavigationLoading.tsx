import CatalogSkeleton from "@/components/BTL/CatalogSkeleton"

type CatalogNavigationLoadingProps = {
  query?: string
  overlay?: boolean
}

export default function CatalogNavigationLoading({
  overlay = false,
}: CatalogNavigationLoadingProps) {
  return <CatalogSkeleton overlay={overlay} includeHero={!overlay} />
}
