import { Sun, Battery, TrendingDown, Users } from 'lucide-react'

const SolarStats = () => {
    const stats = [
        {
            icon: Sun,
            value: '500+',
            label: 'Sistemas Instalados',
            description: 'Homes e empresas energizados',
        },
        {
            icon: Battery,
            value: '2.5MWp',
            label: 'Potência Total',
            description: 'Capacidade instalada',
        },
        {
            icon: TrendingDown,
            value: 'R$ 3.2M',
            label: 'Economia Gerada',
            description: 'Valor economizado por clientes',
        },
        {
            icon: Users,
            value: '98%',
            label: 'Satisfação',
            description: 'Clientes satisfeitos',
        },
    ]

    return (
        <section className='py-16 bg-white'>
            <div className='content-container'>
                <div className='text-center mb-12'>
                    <h2 className='text-3xl font-bold text-gray-900 mb-4'>
                        Nossos Números
                    </h2>
                    <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
                        Resultados que falam por si. Mais de 500 sistemas instalados
                        e milhões economizados em energia.
                    </p>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8'>
                    {stats.map((stat, index) => (
                        <div
                            key={index}
                            className='text-center p-6 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors'
                        >
                            <div className='w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4'>
                                <stat.icon className='w-8 h-8 text-yellow-600' />
                            </div>
                            <div className='text-3xl font-bold text-gray-900 mb-2'>
                                {stat.value}
                            </div>
                            <div className='text-lg font-semibold text-gray-800 mb-1'>
                                {stat.label}
                            </div>
                            <div className='text-sm text-gray-600'>
                                {stat.description}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default SolarStats
