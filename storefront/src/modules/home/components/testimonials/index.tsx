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
        <section className="py-24 bg-gradient-to-br from-slate-50 via-white to-gray-50 dark:from-zinc-950 dark:via-zinc-950 dark:to-zinc-900">
            <div className="content-container">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm rounded-full border border-white/20 dark:border-zinc-800 mb-6">
                        <Quote className="w-4 h-4 text-gray-600 dark:text-zinc-300" />
                        <span className="text-gray-900 dark:text-zinc-50 font-semibold">Depoimentos</span>
                    </div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-zinc-50 mb-4">
                        O que nossos
                        <span className="block bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                            clientes dizem
                        </span>
                    </h2>
                    <p className="text-xl text-gray-600 dark:text-zinc-300 max-w-3xl mx-auto leading-relaxed">
                        Histórias reais de clientes que transformaram suas contas de luz com energia solar
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm p-8 rounded-2xl border border-white/20 dark:border-zinc-800 shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1">
                            <div className="flex items-center mb-6">
                                <div className="w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center mr-4">
                                    <Quote className="w-6 h-6 text-white" />
                                </div>
                                <div className="flex">
                                    {[...Array(testimonial.rating)].map((_, i) => (
                                        <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                                    ))}
                                </div>
                            </div>

                            <p className="text-gray-700 dark:text-zinc-300 mb-8 text-lg leading-relaxed italic">
                                &ldquo;{testimonial.content}&rdquo;
                            </p>

                            <div className="border-t border-gray-200/50 pt-6">
                                <div className="flex justify-between items-center">
                                    <div>
                                        <div className="font-bold text-gray-900 dark:text-zinc-50 text-lg">{testimonial.name}</div>
                                        <div className="text-sm text-gray-600 dark:text-zinc-300">{testimonial.role}</div>
                                        <div className="text-xs text-gray-500 dark:text-zinc-400">{testimonial.location}</div>
                                    </div>
                                    <div className="text-right bg-gradient-to-r from-green-50 to-green-100 px-4 py-2 rounded-xl border border-green-200/50">
                                        <div className="text-sm font-semibold text-green-700">Economia</div>
                                        <div className="text-xl font-bold text-green-800">{testimonial.savings}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center mt-16">
                    <div className="inline-flex items-center gap-4 bg-white/80 dark:bg-zinc-900/60 backdrop-blur-sm px-8 py-4 rounded-2xl border border-white/20 dark:border-zinc-800 shadow-lg">
                        <div className="flex -space-x-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="w-10 h-10 bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 rounded-full border-2 border-white flex items-center justify-center shadow-md">
                                    <span className="text-sm font-bold text-white">{5 - i}</span>
                                </div>
                            ))}
                        </div>
                        <div className="text-left">
                            <div className="text-lg font-bold text-gray-900 dark:text-zinc-50">+497 clientes</div>
                            <div className="text-sm text-gray-600 dark:text-zinc-300">satisfeitos</div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default Testimonials
