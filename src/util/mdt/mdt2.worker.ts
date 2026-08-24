import type { MdtRoute } from '../types.ts'
import {
  decodeMdtStringDirect,
  MdtDecodingError,
  type MdtDecodingStage,
} from './mdt2Core.ts'

type WorkerResponse =
  | { ok: true; route: MdtRoute }
  | { ok: false; stage: MdtDecodingStage; message: string }

const workerScope = self as unknown as {
  onmessage: ((event: MessageEvent<string>) => void) | null
  postMessage: (message: WorkerResponse) => void
}

workerScope.onmessage = async ({ data }) => {
  try {
    workerScope.postMessage({ ok: true, route: await decodeMdtStringDirect(data) })
  } catch (error) {
    const decodingError =
      error instanceof MdtDecodingError
        ? error
        : new MdtDecodingError('structure', 'MDT 路线解析失败。')
    workerScope.postMessage({
      ok: false,
      stage: decodingError.stage,
      message: decodingError.message,
    })
  }
}
