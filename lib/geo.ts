/**
 * Geocoding utilities using OpenStreetMap Nominatim API
 */

/**
 * Geocode an address using OpenStreetMap Nominatim API
 * Free service, no API key required
 */
async function geocodeWithNominatim(
  query: string,
): Promise<{ lat: number; lng: number } | null> {
  try {
    const encodedQuery = encodeURIComponent(query);
    const url = `https://nominatim.openstreetmap.org/search?q=${encodedQuery}&format=json&limit=1&addressdetails=1&countrycodes=in`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Vamaship/1.0", // Required by Nominatim
        "Accept-Language": "en",
      },
    });

    if (!response.ok) {
      console.warn(
        "Nominatim API error:",
        response.status,
        response.statusText,
      );
      return null;
    }

    const data = await response.json();

    if (Array.isArray(data) && data.length > 0) {
      const result = data[0];
      const lat = parseFloat(result.lat);
      const lng = parseFloat(result.lon);

      if (isNaN(lat) || isNaN(lng)) {
        return null;
      }

      return { lat, lng };
    }

    return null;
  } catch (error) {
    console.error("Geocoding error:", error);
    return null;
  }
}

/**
 * Geocode an address using multiple query strategies for better results
 * Optimized for Indian addresses
 */
export async function geocodeAddress(
  address: string,
  addressComponents?: {
    pincode?: string | null;
    city?: string | null;
    state?: string | null;
    country?: string | null;
  },
): Promise<{ lat: number; lng: number } | null> {
  // Strategy 1: Try with pincode first (most reliable for India)
  if (addressComponents?.pincode) {
    const pincodeQuery = `${addressComponents.pincode}, India`;
    const pincodeResult = await geocodeWithNominatim(pincodeQuery);
    if (pincodeResult) {
      return pincodeResult;
    }

    // Small delay to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Strategy 2: Try city + state + pincode
  if (
    addressComponents?.city &&
    addressComponents?.state &&
    addressComponents?.pincode
  ) {
    const cityStateQuery = `${addressComponents.city}, ${addressComponents.state}, ${addressComponents.pincode}, India`;
    const cityStateResult = await geocodeWithNominatim(cityStateQuery);
    if (cityStateResult) {
      return cityStateResult;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Strategy 3: Try city + state
  if (addressComponents?.city && addressComponents?.state) {
    const cityStateQuery = `${addressComponents.city}, ${addressComponents.state}, India`;
    const cityStateResult = await geocodeWithNominatim(cityStateQuery);
    if (cityStateResult) {
      return cityStateResult;
    }

    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  // Strategy 4: Try the full address string
  const fullAddressResult = await geocodeWithNominatim(address);
  if (fullAddressResult) {
    return fullAddressResult;
  }

  return null;
}

/**
 * Build address string from address components
 */
export function buildAddressString(address: {
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
}): string {
  const parts: string[] = [];

  if (address.address_line_1) parts.push(address.address_line_1);
  if (address.address_line_2) parts.push(address.address_line_2);
  if (address.city) parts.push(address.city);
  if (address.state) parts.push(address.state);
  if (address.pincode) parts.push(address.pincode);
  if (address.country) parts.push(address.country);

  return parts.join(", ");
}

/**
 * Extract address components for geocoding
 */
export function getAddressComponents(address: {
  address_line_1?: string | null;
  address_line_2?: string | null;
  city?: string | null;
  state?: string | null;
  pincode?: string | null;
  country?: string | null;
}): {
  pincode?: string | null;
  city?: string | null;
  state?: string | null;
  country?: string | null;
} {
  return {
    pincode: address.pincode,
    city: address.city,
    state: address.state,
    country: address.country,
  };
}
