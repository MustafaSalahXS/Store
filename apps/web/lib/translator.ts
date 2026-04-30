/**
 * Simple translation utility using a free API (MyMemory)
 * This is meant for demonstration/small-scale use.
 * In a production app, use Google Translate or DeepL API.
 */
export const translateText = async (text: string, targetLang: string): Promise<string> => {
  if (!text || !targetLang) return text
  if (targetLang === 'en') return text // Assume source is English

  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|${targetLang}`
    )
    const data = await response.json()
    
    if (data.responseData && data.responseData.translatedText) {
      return data.responseData.translatedText
    }
    return text
  } catch (error) {
    console.error('Translation error:', error)
    return text
  }
}

/**
 * Auto-translates product details
 */
export const translateProduct = async (product: { name: string; description: string }, targetLang: string) => {
  const [translatedName, translatedDesc] = await Promise.all([
    translateText(product.name, targetLang),
    translateText(product.description, targetLang)
  ])
  
  return {
    ...product,
    name: translatedName,
    description: translatedDesc
  }
}
