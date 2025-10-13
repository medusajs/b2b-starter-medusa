"use client"

import Button from "@/modules/common/components/button"
import Input from "@/modules/common/components/input"
import { inviteEmployee } from "@/lib/data/companies"
import { QueryCompany } from "@/types"
import { Container, Text, toast } from "@medusajs/ui"
import { useState } from "react"

const InviteEmployeeCard = ({ company }: { company: QueryCompany }) => {
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
  })

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleInvite = async () => {
    if (!formData.first_name || !formData.last_name || !formData.email) {
      toast.error("Por favor, preencha todos os campos obrigatórios.")
      return
    }

    setIsLoading(true)
    try {
      await inviteEmployee(company.id, formData)
      toast.success("Convite enviado com sucesso!")
      setFormData({
        first_name: "",
        last_name: "",
        email: "",
      })
    } catch (error) {
      console.error("Error inviting employee:", error)
      toast.error("Erro ao enviar convite. Tente novamente.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Container className="p-0 overflow-hidden">
      <div className="grid small:grid-cols-4 grid-cols-2 gap-4 p-4 border-b border-neutral-200">
        <div className="flex flex-col gap-y-2">
          <Text className="font-medium text-neutral-950">Nome</Text>
          <input
            name="first_name"
            value={formData.first_name}
            onChange={handleInputChange}
            placeholder="Digite o nome"
            className="px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-col gap-y-2 justify-end">
          <input
            name="last_name"
            value={formData.last_name}
            onChange={handleInputChange}
            placeholder="Digite o sobrenome"
            className="px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div className="flex flex-col col-span-2 gap-y-2">
          <Text className="font-medium text-neutral-950">E-mail</Text>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            placeholder="Digite um e-mail"
            className="px-3 py-2 border border-neutral-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 bg-neutral-50 p-4">
        <Button
          variant="primary"
          onClick={handleInvite}
          disabled={isLoading}
        >
          {isLoading ? "Enviando..." : "Enviar Convite"}
        </Button>
      </div>
    </Container>
  )
}

export default InviteEmployeeCard
