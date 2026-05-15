export type Locale = "en" | "sv" | "es";

export const locales: Locale[] = ["en", "sv", "es"];
export const defaultLocale: Locale = "en";

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

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
  | "property.types.apartment"
  | "identity.swedish.title"
  | "identity.swedish.description"
  | "identity.swedish.heading"
  | "identity.swedish.subheading"
  | "identity.spanish.title"
  | "identity.spanish.description"
  | "identity.spanish.heading"
  | "identity.spanish.subheading"
  | "identity.wizard.step"
  | "identity.wizard.continue"
  | "identity.wizard.back"
  | "identity.role.title"
  | "identity.role.description"
  | "identity.role.tenant"
  | "identity.role.tenantDesc"
  | "identity.role.host"
  | "identity.role.hostDesc"
  | "identity.documents.title"
  | "identity.documents.description"
  | "identity.documents.type"
  | "identity.documents.selectType"
  | "identity.documents.personnummer"
  | "identity.documents.idCard"
  | "identity.documents.passport"
  | "identity.documents.dni"
  | "identity.documents.nie"
  | "identity.documents.idNumber"
  | "identity.documents.idHelp"
  | "identity.documents.upload"
  | "identity.documents.uploadPrompt"
  | "identity.documents.uploadHelp"
  | "identity.review.title"
  | "identity.review.description"
  | "identity.review.role"
  | "identity.review.verified"
  | "identity.review.documentType"
  | "identity.review.idNumber"
  | "identity.review.documents"
  | "identity.review.trustSignals"
  | "identity.review.signal.identity"
  | "identity.review.signal.documents"
  | "identity.review.signal.role"
  | "identity.review.submit"
  | "cases.page.title"
  | "cases.page.description"
  | "cases.page.heading"
  | "cases.page.subheading"
  | "cases.create"
  | "cases.created"
  | "cases.parties"
  | "cases.viewDetails"
  | "ownership.page.title"
  | "ownership.page.description"
  | "ownership.page.heading"
  | "ownership.page.subheading"
  | "ownership.upload.title"
  | "ownership.upload.description"
  | "ownership.upload.label"
  | "ownership.upload.prompt"
  | "ownership.upload.help"
  | "ownership.registry.title"
  | "ownership.registry.description"
  | "ownership.registry.ref"
  | "ownership.registry.date"
  | "ownership.match.title"
  | "ownership.match.description"
  | "ownership.match.registryOwner"
  | "ownership.match.verifiedHost"
  | "ownership.match.success"
  | "ownership.match.successDesc"
  | "ownership.match.failed"
  | "ownership.match.failedDesc";

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
    "identity.swedish.title": "Swedish Identity Verification - TrustPlatform",
    "identity.swedish.description": "Verify your Swedish identity for cross-border rental transactions",
    "identity.swedish.heading": "Swedish Identity Verification",
    "identity.swedish.subheading": "Complete your identity verification to establish trust with hosts and tenants",
    "identity.spanish.title": "Spanish Identity Verification - TrustPlatform",
    "identity.spanish.description": "Verify your Spanish identity for cross-border rental transactions",
    "identity.spanish.heading": "Spanish Identity Verification",
    "identity.spanish.subheading": "Complete your identity verification to establish trust with hosts and tenants",
    "identity.wizard.step": "Step",
    "identity.wizard.continue": "Continue",
    "identity.wizard.back": "Back",
    "identity.role.title": "Select Your Role",
    "identity.role.description": "Choose whether you're verifying as a tenant or host",
    "identity.role.tenant": "Tenant",
    "identity.role.tenantDesc": "I'm looking to rent a property and need to verify my identity",
    "identity.role.host": "Host",
    "identity.role.hostDesc": "I'm offering a property for rent and need to verify my identity",
    "identity.documents.title": "Identity Documents",
    "identity.documents.description": "Provide your Swedish identity documentation",
    "identity.documents.type": "Document Type",
    "identity.documents.selectType": "Select document type",
    "identity.documents.personnummer": "Personnummer (Swedish ID Number)",
    "identity.documents.idCard": "Swedish ID Card",
    "identity.documents.passport": "Swedish Passport",
    "identity.documents.dni": "DNI (Spanish National ID)",
    "identity.documents.nie": "NIE (Foreigner ID Number)",
    "identity.documents.idNumber": "ID Number",
    "identity.documents.idHelp": "Enter your identification number exactly as shown on your document",
    "identity.documents.upload": "Upload Documents",
    "identity.documents.uploadPrompt": "Click to upload or drag files here",
    "identity.documents.uploadHelp": "Upload clear photos or scans of your ID document (JPEG, PNG, PDF)",
    "identity.review.title": "Verification Summary",
    "identity.review.description": "Review your information before submitting",
    "identity.review.role": "Role",
    "identity.review.verified": "Verified",
    "identity.review.documentType": "Document Type",
    "identity.review.idNumber": "ID Number",
    "identity.review.documents": "Uploaded Documents",
    "identity.review.trustSignals": "Trust Signals",
    "identity.review.signal.identity": "Swedish identity verified via official documentation",
    "identity.review.signal.documents": "Government-issued ID uploaded and validated",
    "identity.review.signal.role": "Role declared and confirmed",
    "identity.review.submit": "Submit Verification",
    "cases.page.title": "Case Management - TrustPlatform",
    "cases.page.description": "Manage verification cases for rental transactions",
    "cases.page.heading": "Case Management",
    "cases.page.subheading": "Track multi-party verification cases for rental properties",
    "cases.create": "Create Case",
    "cases.created": "Created",
    "cases.parties": "Parties",
    "cases.viewDetails": "View Details",
    "ownership.page.title": "Ownership Verification - TrustPlatform",
    "ownership.page.description": "Verify property ownership through Spanish registry documents",
    "ownership.page.heading": "Ownership Verification",
    "ownership.page.subheading": "Upload a Nota Simple to verify the host's ownership of the property",
    "ownership.upload.title": "Upload Nota Simple",
    "ownership.upload.description": "Upload the property registry document to begin ownership verification",
    "ownership.upload.label": "Nota Simple Document",
    "ownership.upload.prompt": "Click to upload or drag PDF here",
    "ownership.upload.help": "Upload a Nota Simple PDF from the Spanish Property Registry",
    "ownership.registry.title": "Registry Information",
    "ownership.registry.description": "Extracted data from the uploaded Nota Simple document",
    "ownership.registry.ref": "Registry Reference",
    "ownership.registry.date": "Registration Date",
    "ownership.match.title": "Ownership Match",
    "ownership.match.description": "Comparing registry owner with verified host identity",
    "ownership.match.registryOwner": "Registry Owner",
    "ownership.match.verifiedHost": "Verified Host",
    "ownership.match.success": "Ownership Confirmed",
    "ownership.match.successDesc": "The registry owner matches the verified host identity",
    "ownership.match.failed": "Ownership Mismatch",
    "ownership.match.failedDesc": "The registry owner does not match the verified host identity",
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
    "identity.swedish.title": "Svensk Identitetsverifiering - TrustPlatform",
    "identity.swedish.description": "Verifiera din svenska identitet för gränsöverskridande hyrestransaktioner",
    "identity.swedish.heading": "Svensk Identitetsverifiering",
    "identity.swedish.subheading": "Slutför din identitetsverifiering för att etablera förtroende med värdar och hyresgäster",
    "identity.spanish.title": "Spansk Identitetsverifiering - TrustPlatform",
    "identity.spanish.description": "Verifiera din spanska identitet för gränsöverskridande hyrestransaktioner",
    "identity.spanish.heading": "Spansk Identitetsverifiering",
    "identity.spanish.subheading": "Slutför din identitetsverifiering för att etablera förtroende med värdar och hyresgäster",
    "identity.wizard.step": "Steg",
    "identity.wizard.continue": "Fortsätt",
    "identity.wizard.back": "Tillbaka",
    "identity.role.title": "Välj Din Roll",
    "identity.role.description": "Välj om du verifierar som hyresgäst eller värd",
    "identity.role.tenant": "Hyresgäst",
    "identity.role.tenantDesc": "Jag söker att hyra en fastighet och behöver verifiera min identitet",
    "identity.role.host": "Värd",
    "identity.role.hostDesc": "Jag erbjuder en fastighet för uthyrning och behöver verifiera min identitet",
    "identity.documents.title": "Identitetshandlingar",
    "identity.documents.description": "Tillhandahåll din svenska identitetsdokumentation",
    "identity.documents.type": "Dokumenttyp",
    "identity.documents.selectType": "Välj dokumenttyp",
    "identity.documents.personnummer": "Personnummer",
    "identity.documents.idCard": "Svenskt ID-kort",
    "identity.documents.passport": "Svenskt Pass",
    "identity.documents.dni": "DNI (Spanskt National-ID)",
    "identity.documents.nie": "NIE (Utlännings-ID-nummer)",
    "identity.documents.idNumber": "ID-nummer",
    "identity.documents.idHelp": "Ange ditt identifikationsnummer exakt som det visas på ditt dokument",
    "identity.documents.upload": "Ladda Upp Dokument",
    "identity.documents.uploadPrompt": "Klicka för att ladda upp eller dra filer hit",
    "identity.documents.uploadHelp": "Ladda upp tydliga foton eller skanningar av ditt ID-dokument (JPEG, PNG, PDF)",
    "identity.review.title": "Verifieringssammanfattning",
    "identity.review.description": "Granska din information innan du skickar in",
    "identity.review.role": "Roll",
    "identity.review.verified": "Verifierad",
    "identity.review.documentType": "Dokumenttyp",
    "identity.review.idNumber": "ID-nummer",
    "identity.review.documents": "Uppladdade Dokument",
    "identity.review.trustSignals": "Förtroende Signaler",
    "identity.review.signal.identity": "Svensk identitet verifierad via officiell dokumentation",
    "identity.review.signal.documents": "Statligt utfärdat ID uppladdat och validerat",
    "identity.review.signal.role": "Roll deklarerad och bekräftad",
    "identity.review.submit": "Skicka Verifiering",
    "cases.page.title": "Ärendehantering - TrustPlatform",
    "cases.page.description": "Hantera verifieringsärenden för hyrestransaktioner",
    "cases.page.heading": "Ärendehantering",
    "cases.page.subheading": "Spåra flerparts-verifieringsärenden för hyresfastigheter",
    "cases.create": "Skapa Ärende",
    "cases.created": "Skapad",
    "cases.parties": "Parter",
    "cases.viewDetails": "Visa Detaljer",
    "ownership.page.title": "Ägarverifiering - TrustPlatform",
    "ownership.page.description": "Verifiera fastighetsägande genom spanska registerdokument",
    "ownership.page.heading": "Ägarverifiering",
    "ownership.page.subheading": "Ladda upp en Nota Simple för att verifiera värdens ägande av fastigheten",
    "ownership.upload.title": "Ladda Upp Nota Simple",
    "ownership.upload.description": "Ladda upp fastighetsregisterdokumentet för att påbörja ägarverifiering",
    "ownership.upload.label": "Nota Simple Dokument",
    "ownership.upload.prompt": "Klicka för att ladda upp eller dra PDF hit",
    "ownership.upload.help": "Ladda upp en Nota Simple PDF från det spanska fastighetsregistret",
    "ownership.registry.title": "Registerinformation",
    "ownership.registry.description": "Extraherad data från det uppladdade Nota Simple-dokumentet",
    "ownership.registry.ref": "Registerreferens",
    "ownership.registry.date": "Registreringsdatum",
    "ownership.match.title": "Ägarmatchning",
    "ownership.match.description": "Jämför registerägare med verifierad värdidentitet",
    "ownership.match.registryOwner": "Registerägare",
    "ownership.match.verifiedHost": "Verifierad Värd",
    "ownership.match.success": "Ägande Bekräftat",
    "ownership.match.successDesc": "Registerägaren matchar den verifierade värdidentiteten",
    "ownership.match.failed": "Ägarmatchning Misslyckades",
    "ownership.match.failedDesc": "Registerägaren matchar inte den verifierade värdidentiteten",
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
    "identity.swedish.title": "Verificación de Identidad Sueca - TrustPlatform",
    "identity.swedish.description": "Verifica tu identidad sueca para transacciones de alquiler transfronterizas",
    "identity.swedish.heading": "Verificación de Identidad Sueca",
    "identity.swedish.subheading": "Completa tu verificación de identidad para establecer confianza con anfitriones e inquilinos",
    "identity.spanish.title": "Verificación de Identidad Española - TrustPlatform",
    "identity.spanish.description": "Verifica tu identidad española para transacciones de alquiler transfronterizas",
    "identity.spanish.heading": "Verificación de Identidad Española",
    "identity.spanish.subheading": "Completa tu verificación de identidad para establecer confianza con anfitriones e inquilinos",
    "identity.wizard.step": "Paso",
    "identity.wizard.continue": "Continuar",
    "identity.wizard.back": "Atrás",
    "identity.role.title": "Selecciona Tu Rol",
    "identity.role.description": "Elige si estás verificando como inquilino o anfitrión",
    "identity.role.tenant": "Inquilino",
    "identity.role.tenantDesc": "Busco alquilar una propiedad y necesito verificar mi identidad",
    "identity.role.host": "Anfitrión",
    "identity.role.hostDesc": "Ofrezco una propiedad en alquiler y necesito verificar mi identidad",
    "identity.documents.title": "Documentos de Identidad",
    "identity.documents.description": "Proporciona tu documentación de identidad sueca",
    "identity.documents.type": "Tipo de Documento",
    "identity.documents.selectType": "Selecciona tipo de documento",
    "identity.documents.personnummer": "Personnummer (Número ID Sueco)",
    "identity.documents.idCard": "Tarjeta de Identidad Sueca",
    "identity.documents.passport": "Pasaporte Sueco",
    "identity.documents.dni": "DNI (Documento Nacional de Identidad)",
    "identity.documents.nie": "NIE (Número de Identidad de Extranjero)",
    "identity.documents.idNumber": "Número de Identificación",
    "identity.documents.idHelp": "Introduce tu número de identificación exactamente como aparece en tu documento",
    "identity.documents.upload": "Subir Documentos",
    "identity.documents.uploadPrompt": "Haz clic para subir o arrastra archivos aquí",
    "identity.documents.uploadHelp": "Sube fotos claras o escaneos de tu documento de identidad (JPEG, PNG, PDF)",
    "identity.review.title": "Resumen de Verificación",
    "identity.review.description": "Revisa tu información antes de enviar",
    "identity.review.role": "Rol",
    "identity.review.verified": "Verificado",
    "identity.review.documentType": "Tipo de Documento",
    "identity.review.idNumber": "Número de Identificación",
    "identity.review.documents": "Documentos Subidos",
    "identity.review.trustSignals": "Señales de Confianza",
    "identity.review.signal.identity": "Identidad sueca verificada mediante documentación oficial",
    "identity.review.signal.documents": "ID emitido por el gobierno subido y validado",
    "identity.review.signal.role": "Rol declarado y confirmado",
    "identity.review.submit": "Enviar Verificación",
    "cases.page.title": "Gestión de Casos - TrustPlatform",
    "cases.page.description": "Gestiona casos de verificación para transacciones de alquiler",
    "cases.page.heading": "Gestión de Casos",
    "cases.page.subheading": "Rastrea casos de verificación multipartitos para propiedades de alquiler",
    "cases.create": "Crear Caso",
    "cases.created": "Creado",
    "cases.parties": "Partes",
    "cases.viewDetails": "Ver Detalles",
    "ownership.page.title": "Verificación de Propiedad - TrustPlatform",
    "ownership.page.description": "Verifica la propiedad mediante documentos del registro español",
    "ownership.page.heading": "Verificación de Propiedad",
    "ownership.page.subheading": "Sube una Nota Simple para verificar la propiedad del anfitrión",
    "ownership.upload.title": "Subir Nota Simple",
    "ownership.upload.description": "Sube el documento del registro de propiedad para comenzar la verificación de propiedad",
    "ownership.upload.label": "Documento Nota Simple",
    "ownership.upload.prompt": "Haz clic para subir o arrastra PDF aquí",
    "ownership.upload.help": "Sube un PDF de Nota Simple del Registro de la Propiedad español",
    "ownership.registry.title": "Información del Registro",
    "ownership.registry.description": "Datos extraídos del documento Nota Simple subido",
    "ownership.registry.ref": "Referencia de Registro",
    "ownership.registry.date": "Fecha de Registro",
    "ownership.match.title": "Coincidencia de Propiedad",
    "ownership.match.description": "Comparando propietario del registro con identidad del anfitrión verificado",
    "ownership.match.registryOwner": "Propietario del Registro",
    "ownership.match.verifiedHost": "Anfitrión Verificado",
    "ownership.match.success": "Propiedad Confirmada",
    "ownership.match.successDesc": "El propietario del registro coincide con la identidad del anfitrión verificado",
    "ownership.match.failed": "Desajuste de Propiedad",
    "ownership.match.failedDesc": "El propietario del registro no coincide con la identidad del anfitrión verificado",
  },
};

export function getTranslation(locale: Locale, key: TranslationKey): string {
  return translations[locale][key] || translations[defaultLocale][key];
}