import { Toast as MedusaToast, Toaster as MedusaToaster, toast } from "@medusajs/ui"

/**
 * Yello Solar Hub Toast Components
 * Wrapper around Medusa UI Toast components
 *
 * @example
 * // Mostrar toast
 * toast.success("Operação realizada com sucesso!")
 * toast.error("Erro ao processar solicitação")
 *
 * // Usar Toaster no layout
 * <Toaster />
 */

const Toast = MedusaToast
const Toaster = MedusaToaster

export { Toast, Toaster, toast }