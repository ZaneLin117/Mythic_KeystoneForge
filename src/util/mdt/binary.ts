/** Base64 and raw-deflate helpers shared by the MDT2 and legacy string codecs. */

export function base64ToBytes(base64: string): Uint8Array {
  if (base64.length % 4 === 1 || !/^[A-Za-z0-9+/]*={0,2}$/.test(base64)) {
    throw new Error('Invalid base64')
  }

  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i)
  }
  return bytes
}

export function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  // Chunked to keep the argument list within the engine's apply() limit for large routes.
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return btoa(binary)
}

async function runStream(
  bytes: Uint8Array,
  stream: ReadableWritablePair,
  maxOutputBytes = Number.POSITIVE_INFINITY,
): Promise<Uint8Array> {
  const reader = new Blob([bytes as BlobPart]).stream().pipeThrough(stream).getReader()
  const chunks: Uint8Array[] = []
  let length = 0
  let streamDone = false

  while (!streamDone) {
    const { done, value } = await reader.read()
    streamDone = done
    if (streamDone) continue

    const chunk = value as Uint8Array
    length += chunk.length
    if (length > maxOutputBytes) {
      await reader.cancel()
      throw new Error(`Decompressed data exceeds ${maxOutputBytes} bytes`)
    }
    chunks.push(chunk)
  }

  const result = new Uint8Array(length)
  let offset = 0
  for (const chunk of chunks) {
    result.set(chunk, offset)
    offset += chunk.length
  }
  return result
}

export function deflateRaw(bytes: Uint8Array): Promise<Uint8Array> {
  return runStream(bytes, new CompressionStream('deflate-raw'))
}

export function inflateRaw(bytes: Uint8Array, maxOutputBytes?: number): Promise<Uint8Array> {
  return runStream(bytes, new DecompressionStream('deflate-raw'), maxOutputBytes)
}
