import Link from 'next/link'
import { Bot, MessageSquare, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 dark:text-white mb-6">
            Assistente Inteligente para o
            <br />
            <span className="text-indigo-600 dark:text-indigo-400">
              Mercado Imobiliário Brasileiro
            </span>
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-3xl mx-auto mb-8">
            Revolucione suas vendas e atendimento com IA. Busque imóveis,
            qualifique leads e forneça insights de mercado em segundos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg h-12 px-8 shadow-lg" asChild>
              <Link href="/chat">
                Começar Agora
              </Link>
            </Button>
            <Button size="lg" variant="outline" className="text-lg h-12 px-8" asChild>
              <Link href="/properties">
                Ver Imóveis
              </Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-lg flex items-center justify-center mb-4">
              <Bot className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Assistente IA Inteligente
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Converse naturalmente em português para buscar imóveis, agendar
              visitas e obter informações detalhadas.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
              <MessageSquare className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Qualificação de Leads
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Capture e qualifique leads automaticamente através de conversas
              naturais e inteligentes.
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-lg">
            <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
              <TrendingUp className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              Insights de Mercado
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Analise tendências, preços médios e estatísticas do mercado
              imobiliário em tempo real.
            </p>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-12 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para transformar seu negócio imobiliário?
          </h2>
          <p className="text-xl mb-8 text-indigo-100">
            Comece gratuitamente e veja como a IA pode revolucionar suas vendas.
          </p>
          <Button size="lg" variant="secondary" className="text-lg h-12 px-8" asChild>
            <Link href="/signup">
              Criar Conta Grátis
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <p className="text-center text-gray-600 dark:text-gray-400">
            © 2025 Assistente Imobiliário IA - POC para o mercado brasileiro
          </p>
        </div>
      </footer>
    </div>
  )
}
