export const locales = ['en', 'fr'] as const
export type Locale = (typeof locales)[number]

export const defaultLocale: Locale = 'en'

export const languages = {
  en: 'English',
  fr: 'Français',
}
