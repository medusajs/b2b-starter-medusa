import LogoIcon from "@/modules/common/icons/logo"
import YelloIcon from "@/modules/common/icons/yello-icon"

export default function TestLogosPage() {
    return (
        <div className="p-8 space-y-8">
            <h1 className="text-3xl font-bold mb-8">Teste de Logos</h1>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">LogoIcon - Tamanhos Variados</h2>
                <div className="space-y-4 bg-white p-4 rounded">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Tamanho Padrão (120x37):</p>
                        <LogoIcon />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Header (100x31):</p>
                        <LogoIcon width={100} height={31} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Small (80x25):</p>
                        <LogoIcon width={80} height={25} />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">YelloIcon - Tamanhos Variados</h2>
                <div className="space-y-4 bg-white p-4 rounded">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Tamanho Padrão (48x15):</p>
                        <YelloIcon />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Footer (120x37):</p>
                        <YelloIcon width={120} height={37} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-2">Small (60x19):</p>
                        <YelloIcon width={60} height={19} />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Dark Mode Test</h2>
                <div className="bg-gray-900 dark:bg-gray-900 p-8 rounded">
                    <p className="text-white mb-4">Em fundo escuro (force dark):</p>
                    <div className="space-y-4">
                        <LogoIcon width={120} height={37} />
                        <YelloIcon width={120} height={37} />
                    </div>
                </div>
            </section>

            <section className="space-y-4">
                <h2 className="text-2xl font-semibold">Imagens Diretas (Debug)</h2>
                <div className="space-y-4 bg-white p-4 rounded">
                    <div>
                        <p className="text-sm text-gray-600 mb-2">yello-black_logomark.png:</p>
                        <img src="/yello-black_logomark.png" alt="Black Logo" style={{ maxWidth: '200px' }} />
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 mb-2">yello-white_logomark.png:</p>
                        <div className="bg-gray-900 p-4 inline-block">
                            <img src="/yello-white_logomark.png" alt="White Logo" style={{ maxWidth: '200px' }} />
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}
