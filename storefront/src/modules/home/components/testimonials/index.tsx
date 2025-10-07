import { Star, Quote } from "lucide-react"

const Testimonials = () => {
    const testimonials = [
        {
            name: "Carlos Silva",
            role: "Proprietário",
            location: "São Paulo, SP",
            content: "Instalei um sistema de 5kWp e minha conta de luz caiu 85%. O investimento voltou em 4 anos e agora tenho energia limpa e gratuita.",
            rating: 5,
            savings: "R$ 450/mês"
        },
        {
            name: "Ana Costa",
            role: "Empresária",
            location: "Rio de Janeiro, RJ",
            content: "O kit completo da Yello Solar Hub foi perfeito para meu negócio. Profissionais competentes e suporte excepcional durante todo o processo.",
            rating: 5,
            savings: "R$ 1.200/mês"
        },
        {
            name: "Roberto Santos",
            role: "Engenheiro",
            location: "Belo Horizonte, MG",
            content: "Como engenheiro, valorizo a qualidade dos equipamentos. Os painéis e inversores da Yello são de primeira linha. Recomendo!",
            rating: 5,
            savings: "R$ 380/mês"
        }
    ]

    return (
        <section className="py-16 bg-gradient-to-br from-yellow-50 to-blue-50">
            <div className="content-container">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">
                        O que Nossos Clientes Dizem
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                        Histórias reais de clientes que transformaram suas contas de luz com energia solar
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-200">
                            <div className="flex items-center mb-4">
                                <Quote className="w-8 h-8 text-yellow-400 mr-2" />
                                <div className="flex">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                            </div>

                            <p className="text-gray-700 mb-6 italic">
                                &ldquo;{testimonial.content}&rdquo;
                            </p>

                            <div className="border-t pt-4">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-semibold text-gray-900">{testimonial.name}</div>
                                        <div className="text-sm text-gray-600">{testimonial.role}</div>
                                        <div className="text-xs text-gray-500">{testimonial.location}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-semibold text-green-600">Economia</div>
                                        <div className="text-lg font-bold text-green-700">{testimonial.savings}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-12">
                    <div className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full shadow-sm">
                        <div className="flex -space-x-2">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-8 h-8 bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full border-2 border-white flex items-center justify-center">
                                    <span className="text-xs font-bold text-gray-900">{5 - i}</span>
                                </div>
                            ))}
                        </div>
                        <span className="text-gray-700 font-medium">+497 clientes satisfeitos</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Testimonials