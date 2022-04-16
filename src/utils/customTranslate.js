import zh from '../locale/zh'
import { getLocale } from './tools'

export default function customTranslate(template, replacements) {
  if (!template || !template.length) {
    return template
  }
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
