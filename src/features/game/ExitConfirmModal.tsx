import { Modal } from "../../components/Modal"
import { Button } from "../../components/Button"
import { useTranslation } from "../../i18n/useTranslation"

interface ExitConfirmModalProps {
  open: boolean
  onStay: () => void
  onConfirm: () => void
}

export const ExitConfirmModal = ({
  open,
  onStay,
  onConfirm,
}: ExitConfirmModalProps) => {
  const { t } = useTranslation()
  return (
    <Modal open={open} onClose={onStay} title={t("exit.title")} maxWidth="max-w-md">
      <p className="leading-relaxed text-muted text-pretty">{t("exit.body")}</p>
      <div className="mt-6 flex justify-end gap-3">
        <Button variant="secondary" onClick={onStay}>
          {t("exit.stay")}
        </Button>
        <Button variant="danger" onClick={onConfirm}>
          {t("exit.confirm")}
        </Button>
      </div>
    </Modal>
  )
}
