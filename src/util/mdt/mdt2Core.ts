import type { MdtRoute } from '../types.ts'
import { base64ToBytes, bytesToBase64, deflateRaw, inflateRaw } from './binary.ts'
import { decodeCbor, encodeCbor } from './cbor.ts'

const prefix = '!~MDT2~'

export const mdtImportLimits = {
  encodedCharacters: 2_000_000,
  compressedBytes: 1_500_000,
  decompressedBytes: 8_000_000,
} as const

export type MdtDecodingStage = 'format' | 'base64' | 'deflate' | 'cbor' | 'structure'

export class MdtDecodingError extends Error {
  constructor(
    readonly stage: MdtDecodingStage,
    message: string,
  ) {
    super(message)
    this.name = 'MdtDecodingError'
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function structureError(message: string): never {
  throw new MdtDecodingError('structure', `MDT 路线结构无效：${message}`)
}

function requireInteger(record: Record<string, unknown>, key: string, minimum: number) {
  const value = record[key]
  if (typeof value !== 'number' || !Number.isInteger(value) || value < minimum) {
    structureError(`${key} 必须是大于或等于 ${minimum} 的整数`)
  }
}

function validateMdtRoute(decoded: unknown): MdtRoute {
  if (!isRecord(decoded)) structureError('顶层数据必须是对象')
  if (typeof decoded.text !== 'string') structureError('缺少路线名称 text')
  if (decoded.uid !== undefined && typeof decoded.uid !== 'string') {
    structureError('uid 必须是字符串')
  }
  if (!isRecord(decoded.value)) structureError('缺少 value 对象')

  const value = decoded.value
  requireInteger(value, 'currentDungeonIdx', 1)
  requireInteger(value, 'currentPull', 0)
  requireInteger(value, 'currentSublevel', 1)
  if (!Array.isArray(value.pulls) || value.pulls.length === 0) {
    structureError('pulls 必须是非空数组')
  }

  for (const [pullIndex, pull] of value.pulls.entries()) {
    if (!isRecord(pull)) structureError(`第 ${pullIndex + 1} 波必须是对象`)

    for (const [enemyIndex, cloneIndexes] of Object.entries(pull)) {
      if (enemyIndex === 'color') {
        if (typeof cloneIndexes !== 'string') {
          structureError(`第 ${pullIndex + 1} 波的 color 必须是字符串`)
        }
        continue
      }
      if (!/^[1-9][0-9]*$/.test(enemyIndex)) {
        structureError(`第 ${pullIndex + 1} 波包含无效 enemyIndex ${enemyIndex}`)
      }
      if (
        !Array.isArray(cloneIndexes) ||
        !cloneIndexes.every(
          (cloneIndex) =>
            typeof cloneIndex === 'number' && Number.isInteger(cloneIndex) && cloneIndex > 0,
        )
      ) {
        structureError(`第 ${pullIndex + 1} 波的 enemyIndex ${enemyIndex} clone 列表无效`)
      }
    }
  }

  if (
    decoded.objects !== undefined &&
    decoded.objects !== null &&
    !Array.isArray(decoded.objects) &&
    !isRecord(decoded.objects)
  ) {
    structureError('objects 必须是数组或对象')
  }

  return decoded as MdtRoute
}

export async function decodeMdtStringDirect(str: string): Promise<MdtRoute> {
  const trimmed = str.trim()

  if (!trimmed.startsWith(prefix)) {
    throw new MdtDecodingError(
      'format',
      '此路线来自旧版 MythicDungeonTools；请更新插件并重新导出 MDT 6.2+ 路线。',
    )
  }

  const encoded = trimmed.slice(prefix.length)
  if (encoded.length === 0) {
    throw new MdtDecodingError('base64', 'MDT 字符串缺少 Base64 数据。')
  }
  if (encoded.length > mdtImportLimits.encodedCharacters) {
    throw new MdtDecodingError(
      'base64',
      `MDT 字符串过大，最多允许 ${mdtImportLimits.encodedCharacters} 个编码字符。`,
    )
  }

  let compressed: Uint8Array
  try {
    compressed = base64ToBytes(encoded)
  } catch {
    throw new MdtDecodingError('base64', 'MDT 字符串的 Base64 数据无效。')
  }
  if (compressed.length > mdtImportLimits.compressedBytes) {
    throw new MdtDecodingError(
      'base64',
      `MDT 压缩数据过大，最多允许 ${mdtImportLimits.compressedBytes} 字节。`,
    )
  }

  let decompressed: Uint8Array
  try {
    decompressed = await inflateRaw(compressed, mdtImportLimits.decompressedBytes)
  } catch {
    throw new MdtDecodingError('deflate', 'MDT 字符串解压失败或解压后数据过大。')
  }

  let decoded: unknown
  try {
    decoded = decodeCbor(decompressed)
  } catch {
    throw new MdtDecodingError('cbor', 'MDT 字符串的 CBOR 数据无效。')
  }

  return validateMdtRoute(decoded)
}

export async function encodeMdtString(mdtRoute: MdtRoute): Promise<string> {
  return prefix + bytesToBase64(await deflateRaw(encodeCbor(mdtRoute)))
}
