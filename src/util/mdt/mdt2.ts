/**
 * MDT's `!~MDT2~` string format, introduced in MDT 6.2: CBOR, raw deflate, then base64. See
 * MythicDungeonTools/Modules/Transmission.lua. Browser imports run in a disposable worker so a
 * malformed route cannot block the editor UI.
 */

import type { MdtRoute } from '../types.ts'
import {
  decodeMdtStringDirect,
  MdtDecodingError,
  type MdtDecodingStage,
} from './mdt2Core.ts'

export { encodeMdtString, MdtDecodingError, mdtImportLimits } from './mdt2Core.ts'
export type { MdtDecodingStage } from './mdt2Core.ts'

type WorkerResponse =
  | { ok: true; route: MdtRoute }
  | { ok: false; stage: MdtDecodingStage; message: string }

const workerTimeoutMs = 10_000

function decodeMdtStringInWorker(str: string): Promise<MdtRoute> {
  return new Promise((resolve, reject) => {
    const worker = new Worker(new URL('./mdt2.worker.ts', import.meta.url), { type: 'module' })
    const timeout = window.setTimeout(() => {
      worker.terminate()
      reject(new MdtDecodingError('deflate', 'MDT 路线解析超时。'))
    }, workerTimeoutMs)

    const finish = () => {
      window.clearTimeout(timeout)
      worker.terminate()
    }

    worker.onmessage = ({ data }: MessageEvent<WorkerResponse>) => {
      finish()
      if (data.ok) {
        resolve(data.route)
      } else {
        reject(new MdtDecodingError(data.stage, data.message))
      }
    }
    worker.onerror = () => {
      finish()
      reject(new MdtDecodingError('structure', 'MDT 路线解析 Worker 运行失败。'))
    }
    worker.postMessage(str)
  })
}

export async function decodeMdtString(str: string): Promise<MdtRoute> {
  if (typeof Worker === 'undefined' || typeof window === 'undefined') {
    return decodeMdtStringDirect(str)
  }
  return decodeMdtStringInWorker(str)
}
