const apiKey = process.env.GOOGLE_PLACES_API_KEY;
const query = process.argv.slice(2).join(' ').trim() || 'บริษัท อำพล เทรดดิ้ง อุบลราชธานี';

if (!apiKey) {
  console.error('Missing GOOGLE_PLACES_API_KEY environment variable.');
  process.exitCode = 1;
} else {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 7000);
  try {
    const response = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': apiKey,
        'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
      },
      body: JSON.stringify({ textQuery: query, languageCode: 'th', regionCode: 'TH', maxResultCount: 5 }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Google Places returned HTTP ${response.status}`);
    const payload = await response.json();
    for (const place of Array.isArray(payload.places) ? payload.places : []) {
      console.log(JSON.stringify({
        placeId: place.id ?? '',
        name: place.displayName?.text ?? '',
        address: place.formattedAddress ?? '',
      }, null, 2));
    }
  } catch (error) {
    console.error(error instanceof Error && error.name === 'AbortError'
      ? 'Google Places request timed out.'
      : 'Unable to find places.');
    process.exitCode = 1;
  } finally {
    clearTimeout(timer);
  }
}
