export async function GET(request: Request) {
  const url = new URL(request.url)
  const code = url.searchParams.get('code')

  if (!code) {
    return Response.json({ error: 'code is required' }, { status: 400 })
  }

  const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${code}.json`, {
    headers: { 'User-Agent': 'Vitally/1.0 (vitally@example.com)' }
  })

  if (!res.ok) {
    return Response.json({ error: 'Product not found' }, { status: 404 })
  }

  const data = (await res.json()) as {
    status: number
    product?: {
      product_name?: string
      product_name_ja?: string
      nutriments?: {
        'energy-kcal_100g'?: number
        proteins_100g?: number
        fat_100g?: number
        carbohydrates_100g?: number
        'energy-kcal_serving'?: number
        proteins_serving?: number
        fat_serving?: number
        carbohydrates_serving?: number
      }
      serving_size?: string
      quantity?: string
    }
  }

  if (data.status !== 1 || !data.product) {
    return Response.json({ error: 'Product not found' }, { status: 404 })
  }

  const p = data.product
  const n = p.nutriments
  const name = p.product_name_ja || p.product_name || ''

  const hasSrv = n?.['energy-kcal_serving'] != null
  const calories = hasSrv ? (n?.['energy-kcal_serving'] ?? 0) : (n?.['energy-kcal_100g'] ?? 0)
  const protein = hasSrv ? (n?.proteins_serving ?? 0) : (n?.proteins_100g ?? 0)
  const fat = hasSrv ? (n?.fat_serving ?? 0) : (n?.fat_100g ?? 0)
  const carbs = hasSrv ? (n?.carbohydrates_serving ?? 0) : (n?.carbohydrates_100g ?? 0)
  const serving = p.serving_size || (hasSrv ? '1食分' : '100g')

  return Response.json({
    name,
    calories: Math.round(calories),
    protein: Math.round(protein),
    fat: Math.round(fat),
    carbs: Math.round(carbs),
    serving,
    barcode: code
  })
}
