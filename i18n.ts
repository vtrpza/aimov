import { getRequestConfig } from 'next-intl/server'

export default getRequestConfig(async () => {
  // We only support pt-BR for this POC
  const locale = 'pt-BR'

  return {
    locale,
    messages: (await import(`./i18n/messages/${locale}.json`)).default
  }
})
