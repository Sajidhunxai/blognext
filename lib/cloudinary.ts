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
  // Format: https://res.cloudinary.com/{cloud_name}/image/upload/{version}/{public_id}.{format}
  const urlParts = url.split('/upload/');
  if (urlParts.length !== 2) {
    return url; // Not a standard Cloudinary URL, return as-is
  }

  const [baseUrl, path] = urlParts;
  
  // Build transformation parameters
  const transformations: string[] = [];
  
  // Add width
  transformations.push(`w_${width}`);
  
  // Add height if provided
  if (height) {
    transformations.push(`h_${height}`);
  }
  
  // Add quality
  if (typeof quality === 'number') {
    transformations.push(`q_${quality}`);
  } else if (quality) {
    transformations.push(`q_${quality}`);
  }
  
  // Add format optimization
  transformations.push('f_auto');
  
  // Add DPR for retina displays
  transformations.push('dpr_auto');
  
  // Combine transformations
  const transformationString = transformations.join(',');
  
  // Reconstruct URL with transformations
  return `${baseUrl}/upload/${transformationString}/${path}`;
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

