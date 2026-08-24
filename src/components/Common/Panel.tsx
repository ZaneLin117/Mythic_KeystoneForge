import type { CSSProperties, ReactNode } from 'react'
import { forwardRef } from 'react'

interface Props {
  row?: boolean
  children: ReactNode
  className?: string
  innerClass?: string
  blue?: boolean
  noRightBorder?: boolean
  absolute?: boolean
  style?: CSSProperties
}

export const Panel = forwardRef<HTMLDivElement, Props>(
  ({ row, children, className, innerClass, blue, noRightBorder, style }, ref) => {
    return (
      <div
        ref={ref}
        className={`app-panel relative rounded-lg flex gap-2
                  ${noRightBorder ? 'rounded-r-none border-r-0' : ''} 
                  ${className ?? ''}`}
        style={style}
      >
        <div
          className={`app-panel-surface absolute w-full h-full z-[-1] rounded-lg
                    ${blue ? 'bg-fancy-blue' : ''}`}
        />
        <div className={`flex ${row ? '' : 'flex-col'} gap-2 p-2 w-full ${innerClass ?? ''}`}>
          {children}
        </div>
      </div>
    )
  },
)

Panel.displayName = 'Panel'
