export type PriceValue = string | number | null | undefined

export type PriceRow = Record<string, PriceValue>

export type ProductPrices = PriceRow

export type TechniquePrices = PriceRow

function safeNumber(value: PriceValue): number {
  const n = Number(value)
  return Number.isFinite(n) ? n : 0
}

export function resolveTierPrice(
  row: PriceRow,
  qty: number,
  pricePrefix: string,
): number {
  if (!row || qty <= 0) return 0

  const tiers: Array<{ section: number; price: number }> = []

  for (let i = 1; i <= 10; i += 1) {
    const section = safeNumber(row[`section_${i}`])
    const price = safeNumber(row[`${pricePrefix}${i}`])

    if (section <= 0 || price <= 0) continue
    tiers.push({ section, price })
  }

  if (!tiers.length) return 0

  tiers.sort((a, b) => a.section - b.section)

  let selected = tiers[0].price

  for (const tier of tiers) {
    if (qty >= tier.section) {
      selected = tier.price
    }
  }

  return safeNumber(selected)
}

export function calculateMakitoQuote(params: {
  qty: number
  colors: number
  productPrices?: ProductPrices | null
  techniquePrices?: TechniquePrices | null
  repeatCliche?: boolean
}) {
  const { qty, colors, techniquePrices, repeatCliche = false } = params

  const safeQty = safeNumber(qty) > 0 ? safeNumber(qty) : 1
  const safeColors = safeNumber(colors) > 0 ? safeNumber(colors) : 1

  const printUnitByColor = techniquePrices
    ? resolveTierPrice(techniquePrices, safeQty, 'price_col_')
    : 0

  const printTheoretical = safeQty * printUnitByColor * safeColors

  const minBase = safeNumber(techniquePrices?.min)
  const factor = 1.5
  const minReal = minBase * factor * safeColors

  const printTotal = Math.max(printTheoretical, minReal)
  const printUnitShown = safeQty > 0 ? printTotal / safeQty : 0

  const rawCliche = repeatCliche
    ? safeNumber(techniquePrices?.cliche_repetition)
    : safeNumber(techniquePrices?.cliche)

  const cliche = rawCliche > 0 ? rawCliche : 0

  const totalGeneral = printTotal + cliche
  const totalPerUnit = safeQty > 0 ? totalGeneral / safeQty : 0

  return {
    qty: safeQty,
    colors: safeColors,
    factor,
    print: {
      unitByColor: Number(printUnitByColor.toFixed(4)),
      theoretical: Number(printTheoretical.toFixed(2)),
      minBase: Number(minBase.toFixed(2)),
      minReal: Number(minReal.toFixed(2)),
      total: Number(printTotal.toFixed(2)),
      unitShown: Number(printUnitShown.toFixed(2)),
      adjustedToMinimum: printTotal > printTheoretical,
    },
    cliche: Number(cliche.toFixed(2)),
    totalGeneral: Number(totalGeneral.toFixed(2)),
    totalPerUnit: Number(totalPerUnit.toFixed(2)),
  }
}