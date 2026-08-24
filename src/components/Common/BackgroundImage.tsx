import { Delayed } from './Delayed.tsx'

export function BackgroundImage() {
  return (
    <Delayed delay={1}>
      <div className="app-background fixed h-screen w-screen" aria-hidden="true" />
    </Delayed>
  )
}
