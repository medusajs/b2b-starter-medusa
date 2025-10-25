"use client"

import Button from "@/modules/common/components/button"
import { B2BCustomer } from "@/types"
import { Container, Text, toast } from "@medusajs/ui"

const SecurityCard = ({ customer }: { customer: B2BCustomer }) => {
  return (
    <div className="h-fit">
      <Container className="p-0 overflow-hidden">
        <div className="grid grid-cols-2 gap-4 border-b border-neutral-200 p-4">
          <div className="flex flex-col gap-y-2">
            <Text className="font-medium text-neutral-950">Senha</Text>
            <Text className=" text-neutral-500">***************</Text>
          </div>
          <div className="flex flex-col gap-y-2">
            <Text className="font-medium text-neutral-950">Proteção de Dados (LGPD)</Text>
            <Text className="text-neutral-500 text-sm">
              Seus dados estão protegidos conforme a Lei Geral de Proteção de Dados (LGPD).
              Você tem direito de acessar, corrigir ou excluir suas informações pessoais.
            </Text>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 bg-neutral-50 p-4">
          <div className="flex gap-2">
            <Button
              variant="secondary"
              size="small"
              onClick={() => toast.info("Solicitar dados - Em breve")}
            >
              Solicitar Dados
            </Button>
            <Button
              variant="secondary"
              size="small"
              onClick={() => toast.info("Excluir conta - Em breve")}
            >
              Excluir Conta
            </Button>
          </div>
          <Button
            variant="secondary"
            onClick={() => toast.info("Não implementado")}
          >
            Editar
          </Button>
        </div>
      </Container>
    </div>
  )
}

export default SecurityCard
