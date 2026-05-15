export type Locale = "en" | "sv" | "es";

export const locales: Locale[] = ["en", "sv", "es"];
export const defaultLocale: Locale = "en";

export type TranslationKey =
  | "nav.home"
  | "nav.verify"
  | "nav.cases"
  | "nav.admin"
  | "nav.language"
  | "home.hero.title"
  | "home.hero.subtitle"
  | "home.cta.property"
  | "home.cta.identity"
  | "home.feature.property.title"
  | "home.feature.property.description"
  | "home.feature.identity.title"
  | "home.feature.identity.description"
  | "home.feature.ownership.title"
  | "home.feature.ownership.description"
  | "property.page.title"
  | "property.page.description"
  | "property.page.heading"
  | "property.page.subheading"
  | "property.search.title"
  | "property.search.description"
  | "property.search.address"
  | "property.search.addressPlaceholder"
  | "property.search.or"
  | "property.search.cadastralRef"
  | "property.search.cadastralHelp"
  | "property.search.submit"
  | "property.profile.title"
  | "property.profile.cadastralRef"
  | "property.profile.propertyType"
  | "property.profile.municipality"
  | "property.profile.province"
  | "property.profile.licenseNumber"
  | "property.profile.nextStep"
  | "property.profile.status.verified"
  | "property.profile.status.pending"
  | "property.profile.status.none"
  | "property.compliance.title"
  | "property.compliance.description"
  | "property.compliance.touristLicense"
  | "property.compliance.touristLicenseDesc"
  | "property.compliance.registration"
  | "property.compliance.registrationDesc"
  | "property.notFound.title"
  | "property.notFound.description"
  | "property.notFound.suggestions.title"
  | "property.notFound.suggestions.checkAddress"
  | "property.notFound.suggestions.cadastralFormat"
  | "property.notFound.suggestions.contact"
  | "property.notFound.tryAgain"
  | "property.types.apartment";

const translations: Record<Locale, Record<TranslationKey, string>> = {
  en: {
    "nav.home": "Home",
    "nav.verify": "Verify",
    "nav.cases": "Cases",
    "nav.admin": "Admin",
    "nav.language": "Language",
    "home.hero.title": "Cross-Border Rental Verification",
    "home.hero.subtitle": "Establish trust across Sweden and Spain. Verify properties, identities, and ownership connections with institutional-grade confidence.",
    "home.cta.property": "Verify Property",
    "home.cta.identity": "Verify Identity",
    "home.feature.property.title": "Property Verification",
    "home.feature.property.description": "Lookup addresses, cadastral references, and compliance status for rental properties in Spain.",
    "home.feature.identity.title": "Identity Verification",
    "home.feature.identity.description": "Document-backed verification for Swedish and Spanish nationals with multi-party support.",
    "home.feature.ownership.title": "Ownership Verification",
    "home.feature.ownership.description": "Match property registry evidence (Nota Simple) to establish host legitimacy.",
    "property.page.title": "Property Verification - TrustPlatform",
    "property.page.description": "Search and verify rental property compliance in Spain",
    "property.page.heading": "Property Verification",
    "property.page.subheading": "Search by address or cadastral reference to verify compliance and licensing status",
    "property.search.title": "Search Property",
    "property.search.description": "Enter the property address or cadastral reference to begin verification",
    "property.search.address": "Property Address",
    "property.search.addressPlaceholder": "Enter street address, city, province",
    "property.search.or": "OR",
    "property.search.cadastralRef": "Cadastral Reference",
    "property.search.cadastralHelp": "20-character Spanish cadastral reference code",
    "property.search.submit": "Search Property",
    "property.profile.title": "Property Details",
    "property.profile.cadastralRef": "Cadastral Reference",
    "property.profile.propertyType": "Property Type",
    "property.profile.municipality": "Municipality",
    "property.profile.province": "Province",
    "property.profile.licenseNumber": "Tourist License",
    "property.profile.nextStep": "Continue to Identity Verification",
    "property.profile.status.verified": "Verified",
    "property.profile.status.pending": "Pending",
    "property.profile.status.none": "No License",
    "property.compliance.title": "Compliance Requirements",
    "property.compliance.description": "This property must meet the following regional requirements for short-term rental operations:",
    "property.compliance.touristLicense": "Tourist Accommodation License",
    "property.compliance.touristLicenseDesc": "Required by autonomous community regulations for properties listed on rental platforms",
    "property.compliance.registration": "Registry Inscription",
    "property.compliance.registrationDesc": "Property must be registered with local tourism authorities",
    "property.notFound.title": "Property Not Found",
    "property.notFound.description": "We couldn't locate a property matching your search criteria",
    "property.notFound.suggestions.title": "Suggestions:",
    "property.notFound.suggestions.checkAddress": "Double-check the address spelling and format",
    "property.notFound.suggestions.cadastralFormat": "Ensure cadastral reference is exactly 20 characters",
    "property.notFound.suggestions.contact": "Contact support if the property should exist in our system",
    "property.notFound.tryAgain": "Try Another Search",
    "property.types.apartment": "Apartment",
  },
  sv: {
    "nav.home": "Hem",
    "nav.verify": "Verifiera",
    "nav.cases": "Ärenden",
    "nav.admin": "Admin",
    "nav.language": "Språk",
    "home.hero.title": "Gränsöverskridande Hyresverifiering",
    "home.hero.subtitle": "Skapa förtroende mellan Sverige och Spanien. Verifiera fastigheter, identiteter och ägarförhållanden med institutionell säkerhet.",
    "home.cta.property": "Verifiera Fastighet",
    "home.cta.identity": "Verifiera Identitet",
    "home.feature.property.title": "Fastighetsverifiering",
    "home.feature.property.description": "Slå upp adresser, fastighetsbeteckningar och efterlevnadsstatus för hyresfastigheter i Spanien.",
    "home.feature.identity.title": "Identitetsverifiering",
    "home.feature.identity.description": "Dokumentbaserad verifiering för svenska och spanska medborgare med flerparters-stöd.",
    "home.feature.ownership.title": "Ägarverifiering",
    "home.feature.ownership.description": "Matcha fastighetsregisterbevis (Nota Simple) för att fastställa värdens legitimitet.",
    "property.page.title": "Fastighetsverifiering - TrustPlatform",
    "property.page.description": "Sök och verifiera efterlevnad för hyresfastigheter i Spanien",
    "property.page.heading": "Fastighetsverifiering",
    "property.page.subheading": "Sök efter adress eller fastighetsbeteckning för att verifiera efterlevnad och licensstatus",
    "property.search.title": "Sök Fastighet",
    "property.search.description": "Ange fastighetens adress eller fastighetsbeteckning för att påbörja verifiering",
    "property.search.address": "Fastighetsadress",
    "property.search.addressPlaceholder": "Ange gatuadress, stad, provins",
    "property.search.or": "ELLER",
    "property.search.cadastralRef": "Fastighetsbeteckning",
    "property.search.cadastralHelp": "20-tecken spansk fastighetsbeteckningskod",
    "property.search.submit": "Sök Fastighet",
    "property.profile.title": "Fastighetsuppgifter",
    "property.profile.cadastralRef": "Fastighetsbeteckning",
    "property.profile.propertyType": "Fastighetstyp",
    "property.profile.municipality": "Kommun",
    "property.profile.province": "Provins",
    "property.profile.licenseNumber": "Turistlicens",
    "property.profile.nextStep": "Fortsätt till Identitetsverifiering",
    "property.profile.status.verified": "Verifierad",
    "property.profile.status.pending": "Väntande",
    "property.profile.status.none": "Ingen Licens",
    "property.compliance.title": "Efterlevnadskrav",
    "property.compliance.description": "Denna fastighet måste uppfylla följande regionala krav för korttidsuthyrning:",
    "property.compliance.touristLicense": "Turistboende Licens",
    "property.compliance.touristLicenseDesc": "Krävs enligt regionala föreskrifter för fastigheter listade på uthyrningsplattformar",
    "property.compliance.registration": "Registerinskriving",
    "property.compliance.registrationDesc": "Fastigheten måste vara registrerad hos lokala turism-myndigheter",
    "property.notFound.title": "Fastighet Hittades Inte",
    "property.notFound.description": "Vi kunde inte hitta en fastighet som matchar dina sökkriterier",
    "property.notFound.suggestions.title": "Förslag:",
    "property.notFound.suggestions.checkAddress": "Dubbelkolla stavningen och formatet på adressen",
    "property.notFound.suggestions.cadastralFormat": "Säkerställ att fastighetsbeteckningen är exakt 20 tecken",
    "property.notFound.suggestions.contact": "Kontakta support om fastigheten borde finnas i vårt system",
    "property.notFound.tryAgain": "Försök Igen",
    "property.types.apartment": "Lägenhet",
  },
  es: {
    "nav.home": "Inicio",
    "nav.verify": "Verificar",
    "nav.cases": "Casos",
    "nav.admin": "Admin",
    "nav.language": "Idioma",
    "home.hero.title": "Verificación Transfronteriza de Alquileres",
    "home.hero.subtitle": "Establece confianza entre Suecia y España. Verifica propiedades, identidades y conexiones de propiedad con confianza institucional.",
    "home.cta.property": "Verificar Propiedad",
    "home.cta.identity": "Verificar Identidad",
    "home.feature.property.title": "Verificación de Propiedad",
    "home.feature.property.description": "Consulta direcciones, referencias catastrales y estado de cumplimiento para propiedades de alquiler en España.",
    "home.feature.identity.title": "Verificación de Identidad",
    "home.feature.identity.description": "Verificación respaldada por documentos para nacionales suecos y españoles con soporte multipartito.",
    "home.feature.ownership.title": "Verificación de Propiedad",
    "home.feature.ownership.description": "Coteja la evidencia del registro de propiedad (Nota Simple) para establecer la legitimidad del anfitrión.",
    "property.page.title": "Verificación de Propiedad - TrustPlatform",
    "property.page.description": "Busca y verifica el cumplimiento de propiedades de alquiler en España",
    "property.page.heading": "Verificación de Propiedad",
    "property.page.subheading": "Busca por dirección o referencia catastral para verificar cumplimiento y estado de licencia",
    "property.search.title": "Buscar Propiedad",
    "property.search.description": "Introduce la dirección o referencia catastral de la propiedad para comenzar la verificación",
    "property.search.address": "Dirección de la Propiedad",
    "property.search.addressPlaceholder": "Introduce calle, ciudad, provincia",
    "property.search.or": "O",
    "property.search.cadastralRef": "Referencia Catastral",
    "property.search.cadastralHelp": "Código de referencia catastral español de 20 caracteres",
    "property.search.submit": "Buscar Propiedad",
    "property.profile.title": "Detalles de la Propiedad",
    "property.profile.cadastralRef": "Referencia Catastral",
    "property.profile.propertyType": "Tipo de Propiedad",
    "property.profile.municipality": "Municipio",
    "property.profile.province": "Provincia",
    "property.profile.licenseNumber": "Licencia Turística",
    "property.profile.nextStep": "Continuar a Verificación de Identidad",
    "property.profile.status.verified": "Verificado",
    "property.profile.status.pending": "Pendiente",
    "property.profile.status.none": "Sin Licencia",
    "property.compliance.title": "Requisitos de Cumplimiento",
    "property.compliance.description": "Esta propiedad debe cumplir los siguientes requisitos regionales para operaciones de alquiler a corto plazo:",
    "property.compliance.touristLicense": "Licencia de Alojamiento Turístico",
    "property.compliance.touristLicenseDesc": "Requerida por las normativas de la comunidad autónoma para propiedades listadas en plataformas de alquiler",
    "property.compliance.registration": "Inscripción en Registro",
    "property.compliance.registrationDesc": "La propiedad debe estar registrada con las autoridades locales de turismo",
    "property.notFound.title": "Propiedad No Encontrada",
    "property.notFound.description": "No pudimos localizar una propiedad que coincida con tus criterios de búsqueda",
    "property.notFound.suggestions.title": "Sugerencias:",
    "property.notFound.suggestions.checkAddress": "Verifica la ortografía y el formato de la dirección",
    "property.notFound.suggestions.cadastralFormat": "Asegúrate de que la referencia catastral tenga exactamente 20 caracteres",
    "property.notFound.suggestions.contact": "Contacta con soporte si la propiedad debería existir en nuestro sistema",
    "property.notFound.tryAgain": "Intentar Nueva Búsqueda",
    "property.types.apartment": "Apartamento",
  },
};

export function getTranslation(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || translations[defaultLocale][key];
}