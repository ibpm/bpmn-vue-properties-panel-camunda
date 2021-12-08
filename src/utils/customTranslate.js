import zh from '@/locale/zh'
import { getLocale } from '@/utils/tools'

export default function customTranslate(template, replacements) {
  const lang = getLocale() || 'zh'
  if (lang.startsWith('zh')) {
    // Translate
    template = zh[template] || template
  }
  replacements = replacements || {}

  // Replace
  return template.replace(/{([^}]+)}/g, function(_, key) {
    return replacements[key] || '{' + key + '}'
  })
}
