import type { SampleRoutes } from './sampleRoutesUncompiled.ts'

/** Hand-curated network routes. Ranked routes come from src/api/rankingsApi.ts at runtime. */
// prettier-ignore
export const networkSampleRoutes = import.meta.compileTime<SampleRoutes>('./sampleRoutesUncompiled.ts')
