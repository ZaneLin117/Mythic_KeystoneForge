import { useI18n } from '../../../i18n/useI18n.ts'

interface Props {
  input: string
  setInput: (value: string) => void
  onClose: () => void
}

export function RenameRouteInput({ setInput, input, onClose }: Props) {
  const { t } = useI18n()

  return (
    <input
      className="fancy w-full rounded-md"
      autoFocus
      placeholder={t('route.namePlaceholder')}
      onKeyDown={(e) => e.key === 'Enter' && onClose()}
      onChange={(e) => setInput(e.target.value)}
      value={input}
    />
  )
}
