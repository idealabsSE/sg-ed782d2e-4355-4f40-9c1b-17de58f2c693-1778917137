export type Locale = "en" | "sv" | "es";

export const locales: Locale[] = ["en", "sv", "es"];

export const defaultLocale: Locale = "en";

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export type TranslationKey = keyof typeof translations.en;

export const translations = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.verify": "Verify",
    "nav.cases": "Cases",
    "nav.admin": "Admin",
    "nav.language": "Language",
    
    // Home page
    "home.hero.title": "Cross-Border Rental Trust",
    "home.hero.subtitle": "Verify properties, identities, and ownership connections across Sweden and Spain",
    "home.cta.property": "Verify Property",
    "home.cta.identity": "Verify Identity",
    "home.feature.property.title": "Property Compliance",
    "home.feature.property.description": "Check regional licensing and registration status",
    "home.feature.identity.title": "Identity Verification",
    "home.feature.identity.description": "Swedish and Spanish document validation",
    "home.feature.ownership.title": "Ownership Proof",
    "home.feature.ownership.description": "Registry evidence matching and validation",
    
    // Common
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.submit": "Submit",
    "common.continue": "Continue",
    "common.back": "Back",
    "common.next": "Next",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.close": "Close",
    "common.search": "Search",
    "common.filter": "Filter",
    "common.clear": "Clear",
    "common.results": "Results",
    "common.noResults": "No results found",
    
    // Status
    "status.pending": "Pending",
    "status.verified": "Verified",
    "status.flagged": "Flagged",
    "status.approved": "Approved",
    "status.rejected": "Rejected",
  },
  sv: {
    // Navigation
    "nav.home": "Hem",
    "nav.verify": "Verifiera",
    "nav.cases": "Ärenden",
    "nav.admin": "Admin",
    "nav.language": "Språk",
    
    // Home page
    "home.hero.title": "Gränsöverskridande Uthyrningsförtroende",
    "home.hero.subtitle": "Verifiera fastigheter, identiteter och ägaranslutningar mellan Sverige och Spanien",
    "home.cta.property": "Verifiera Fastighet",
    "home.cta.identity": "Verifiera Identitet",
    "home.feature.property.title": "Fastighetsefterlevnad",
    "home.feature.property.description": "Kontrollera regional licensiering och registreringsstatus",
    "home.feature.identity.title": "Identitetsverifiering",
    "home.feature.identity.description": "Svensk och spansk dokumentvalidering",
    "home.feature.ownership.title": "Ägandebevis",
    "home.feature.ownership.description": "Registermatchning och validering",
    
    // Common
    "common.loading": "Laddar...",
    "common.error": "Fel",
    "common.success": "Framgång",
    "common.cancel": "Avbryt",
    "common.submit": "Skicka",
    "common.continue": "Fortsätt",
    "common.back": "Tillbaka",
    "common.next": "Nästa",
    "common.save": "Spara",
    "common.delete": "Ta bort",
    "common.edit": "Redigera",
    "common.close": "Stäng",
    "common.search": "Sök",
    "common.filter": "Filtrera",
    "common.clear": "Rensa",
    "common.results": "Resultat",
    "common.noResults": "Inga resultat hittades",
    
    // Status
    "status.pending": "Väntande",
    "status.verified": "Verifierad",
    "status.flagged": "Flaggad",
    "status.approved": "Godkänd",
    "status.rejected": "Avvisad",
  },
  es: {
    // Navigation
    "nav.home": "Inicio",
    "nav.verify": "Verificar",
    "nav.cases": "Casos",
    "nav.admin": "Admin",
    "nav.language": "Idioma",
    
    // Home page
    "home.hero.title": "Confianza en Alquileres Transfronterizos",
    "home.hero.subtitle": "Verifica propiedades, identidades y conexiones de propiedad entre Suecia y España",
    "home.cta.property": "Verificar Propiedad",
    "home.cta.identity": "Verificar Identidad",
    "home.feature.property.title": "Cumplimiento de Propiedad",
    "home.feature.property.description": "Comprueba el estado de licencias y registro regional",
    "home.feature.identity.title": "Verificación de Identidad",
    "home.feature.identity.description": "Validación de documentos suecos y españoles",
    "home.feature.ownership.title": "Prueba de Propiedad",
    "home.feature.ownership.description": "Coincidencia y validación de evidencia registral",
    
    // Common
    "common.loading": "Cargando...",
    "common.error": "Error",
    "common.success": "Éxito",
    "common.cancel": "Cancelar",
    "common.submit": "Enviar",
    "common.continue": "Continuar",
    "common.back": "Atrás",
    "common.next": "Siguiente",
    "common.save": "Guardar",
    "common.delete": "Eliminar",
    "common.edit": "Editar",
    "common.close": "Cerrar",
    "common.search": "Buscar",
    "common.filter": "Filtrar",
    "common.clear": "Limpiar",
    "common.results": "Resultados",
    "common.noResults": "No se encontraron resultados",
    
    // Status
    "status.pending": "Pendiente",
    "status.verified": "Verificado",
    "status.flagged": "Marcado",
    "status.approved": "Aprobado",
    "status.rejected": "Rechazado",
  },
} as const;

export function getTranslation(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || translations[defaultLocale][key];
}