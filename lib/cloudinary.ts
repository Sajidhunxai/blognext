/**
 * Utility functions for optimizing Cloudinary image URLs
 */

/**
 * Optimizes a Cloudinary URL for responsive images
 * @param url - The original Cloudinary URL
 * @param width - Desired width in pixels
 * @param height - Optional height in pixels
 * @param quality - Image quality (default: 'auto:good')
 * @returns Optimized Cloudinary URL with transformations
 */
export function optimizeCloudinaryUrl(
  url: string,
  width: number,
  height?: number,
  quality: string | number = 'auto:good'
): string {
  // If it's not a Cloudinary URL, return as-is
  if (!url.includes('res.cloudinary.com')) {
    return url;
  }

  // Parse the Cloudinary URL
  // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{transformations}/{version}/{public_id}.{format}
  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) {
    return url; // Not a standard Cloudinary URL, return as-is
  }

  const [baseUrl, path] = urlParts;
  
  // Check if URL already has transformations (not starting with version number)
  // Cloudinary URLs with transformations: /upload/{transformations}/v{version}/{public_id}
  // Cloudinary URLs without: /upload/v{version}/{public_id}
  const pathParts = path.split('/');
  const startsWithVersion = pathParts[0].match(/^v\d+$/);
  const hasExistingTransformations = !startsWithVersion && pathParts.length > 1;
  
  // Build new transformation parameters
  const newTransformations: string[] = [];
  
  // Add width
  newTransformations.push(`w_${width}`);
  
  // Add height if provided
  if (height) {
    newTransformations.push(`h_${height}`);
  }
  
  // Add quality
  if (typeof quality === 'number') {
    newTransformations.push(`q_${quality}`);
  } else if (quality) {
    newTransformations.push(`q_${quality}`);
  }
  
  // Add format optimization
  newTransformations.push('f_auto');

  // NOTE: dpr_auto is intentionally omitted. srcset uses `w` descriptors ([1x, 2x]
  // widths) so the browser picks the correct size without Cloudinary needing to
  // guess DPR via a client-hint header. dpr_auto also makes URLs non-deterministic,
  // which breaks the preload cache-hit for the LCP image.
  
  const newTransformationString = newTransformations.join(',');
  
  // If there are existing transformations, always chain with / separator.
  // IMPORTANT: do NOT merge size params into an l_ (overlay) group — Cloudinary
  // would apply w_/h_ to the overlay layer, not the final composed image.
  // Chaining as a separate step ensures sizing applies after the overlay is applied.
  if (hasExistingTransformations) {
    const existingTransformations = pathParts[0];
    const restOfPath = pathParts.slice(1).join('/');
    return `${baseUrl}/upload/${existingTransformations}/${newTransformationString}/${restOfPath}`;
  }
  
  // No existing transformations, just add ours
  return `${baseUrl}/upload/${newTransformationString}/${path}`;
}

/**
 * Gets responsive srcset for Cloudinary images
 * @param url - The original Cloudinary URL
 * @param sizes - Array of widths for responsive images
 * @returns srcset string
 */
export function getCloudinarySrcSet(url: string, sizes: number[]): string {
  return sizes
    .map((width) => {
      const optimizedUrl = optimizeCloudinaryUrl(url, width);
      return `${optimizedUrl} ${width}w`;
    })
    .join(', ');
}

/**
 * Extracts public ID from Cloudinary URL
 * @param url - Cloudinary URL
 * @returns Public ID or null
 */
export function getCloudinaryPublicId(url: string): string | null {
  if (!url.includes('res.cloudinary.com')) {
    return null;
  }
  
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+?)(?:\.[^.]+)?$/);
  return match ? match[1] : null;
}

