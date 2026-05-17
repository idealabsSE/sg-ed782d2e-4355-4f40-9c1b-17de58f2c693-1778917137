export type Locale = "en" | "sv" | "es";
export type TranslationKey = string;

export const locales: Locale[] = ["en", "sv", "es"];
export const defaultLocale: Locale = "en";

export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export const translations = {
  en: {
    nav: {
      home: "Home",
      verify: "Verify",
      cases: "Cases",
      admin: "Admin",
      language: "Language",
    },
    home: {
      hero: {
        title: "Cross-Border Rental Verification",
        subtitle: "Building trust in Spanish property rentals for Swedish and Spanish users",
      },
      cta: {
        property: "Verify Property",
        identity: "Verify Identity",
      },
      feature: {
        property: {
          title: "Property Verification",
          description: "Validate tourist licenses and legal compliance",
        },
        identity: {
          title: "Identity Verification",
          description: "Secure Swedish and Spanish identity verification",
        },
        ownership: {
          title: "Ownership Verification",
          description: "Match property records with verified hosts",
        },
      },
    },
    property: {
      search: {
        title: "Property Verification",
        description: "Enter property details to begin verification",
        cadastralRef: "Cadastral Reference",
        cadastralRefPlaceholder: "e.g., 1234567AB8901C",
        address: "Address",
        addressPlaceholder: "e.g., Calle Mayor 1, Valencia",
        submit: "Search Property",
        searching: "Searching...",
      },
      profile: {
        title: "Property Information",
        cadastralRef: "Cadastral Reference",
        region: "Region",
        licenseNumber: "Tourist License Number",
        nextStep: "Continue Verification",
        status: {
          verified: "Verified",
          pending: "Pending Verification",
          none: "No License",
        },
      },
      compliance: {
        title: "Compliance Overview",
        description: "This property must meet the following requirements for legal rental operation:",
        touristLicense: "Tourist License",
        touristLicenseDesc: "Valid regional tourist accommodation license",
        nationalRegistration: "National Registration (NRA)",
        nationalRegistrationDesc: "Registered with National Rental Registry (NRUA)",
        registration: "Property Registration",
        registrationDesc: "Registered with local authorities",
      },
      spotCheck: {
        button: "Live Spot-Check",
        checking: "Checking SForms...",
        complete: "Spot-Check Complete",
        error: "Spot-Check Failed",
        unexpectedError: "An unexpected error occurred during the spot-check",
        missingData: "Missing Information",
        missingDataDesc: "License number and region are required for spot-check",
        status: "Status",
        holder: "License Holder",
        validFrom: "Valid From",
        lastChecked: "Last Checked",
        statusActive: "License is active in regional registry",
        statusInactive: "License is inactive or revoked",
        statusNotFound: "License not found in registry",
        statusError: "Error checking license status",
      },
      notFound: {
        title: "Property Not Found",
        description: "No property found matching your search criteria. Would you like to create a new property record?",
      },
    },
    nationalLicense: {
      registrationNumber: "Registration Number",
      holder: "Holder",
      expiresAt: "Expires",
      status: {
        active: "Active",
        pending: "Pending",
        suspended: "Suspended",
        cancelled: "Cancelled",
      },
      form: {
        title: "National License Information",
        description: "Enter or update the National Rental Registration details for this property.",
        add: "Add National License",
        edit: "Edit National License",
        registrationNumber: "Registration Number",
        status: "Status",
        holderName: "Holder Name",
        holderNamePlaceholder: "Full legal name of license holder",
        registeredAt: "Registered Date",
        expiresAt: "Expiry Date",
        notes: "Notes",
        notesPlaceholder: "Additional information or verification details",
        submit: "Save License",
        success: "National License Saved",
        successDesc: "The national license information has been updated successfully.",
        error: "Save Failed",
        unexpectedError: "An unexpected error occurred while saving the license.",
      },
    },
    identity: {
      swedish: {
        title: "Swedish Identity Verification",
        description: "Verify your Swedish identity",
      },
      spanish: {
        title: "Spanish Identity Verification",
        description: "Verify your Spanish identity",
      },
    },
    cases: {
      page: {
        title: "Verification Cases",
        description: "Manage verification cases",
      },
      create: "Create Case",
      noCases: "No Cases",
      noCasesDesc: "You haven't created any verification cases yet",
    },
    admin: {
      page: {
        title: "Admin Dashboard",
        description: "Review and approve verification requests",
      },
      noCases: "No Pending Reviews",
      noCasesDesc: "All verification cases have been processed",
    },
    common: {
      error: "Error",
      loading: "Loading...",
    },
  },
  sv: {
    nav: {
      home: "Hem",
      verify: "Verifiera",
      cases: "Ärenden",
      admin: "Admin",
      language: "Språk",
    },
    home: {
      hero: {
        title: "Gränsöverskridande Hyresverifiering",
        subtitle: "Bygger förtroende för spanska fastighetsuthyrningar för svenska och spanska användare",
      },
      cta: {
        property: "Verifiera fastighet",
        identity: "Verifiera identitet",
      },
      feature: {
        property: {
          title: "Fastighetsverifiering",
          description: "Validera turistlicenser och juridisk efterlevnad",
        },
        identity: {
          title: "Identitetsverifiering",
          description: "Säker svensk och spansk identitetsverifiering",
        },
        ownership: {
          title: "Ägarskapsverifiering",
          description: "Matcha fastighetsregister med verifierade värdar",
        },
      },
    },
    property: {
      search: {
        title: "Fastighetsverifiering",
        description: "Ange fastighetsuppgifter för att påbörja verifiering",
        cadastralRef: "Katasterreferens",
        cadastralRefPlaceholder: "t.ex. 1234567AB8901C",
        address: "Adress",
        addressPlaceholder: "t.ex. Calle Mayor 1, Valencia",
        submit: "Sök fastighet",
        searching: "Söker...",
      },
      profile: {
        title: "Fastighetsinformation",
        cadastralRef: "Katasterreferens",
        region: "Region",
        licenseNumber: "Turistlicensnummer",
        nextStep: "Fortsätt verifiering",
        status: {
          verified: "Verifierad",
          pending: "Väntar på verifiering",
          none: "Ingen licens",
        },
      },
      compliance: {
        title: "Efterlevnadsöversikt",
        description: "Denna fastighet måste uppfylla följande krav för laglig uthyrning:",
        touristLicense: "Turistlicens",
        touristLicenseDesc: "Giltig regional turistboendelicens",
        nationalRegistration: "Nationell registrering (NRA)",
        nationalRegistrationDesc: "Registrerad i nationellt hyresregister (NRUA)",
        registration: "Fastighetsregistrering",
        registrationDesc: "Registrerad hos lokala myndigheter",
      },
      spotCheck: {
        button: "Live-kontroll",
        checking: "Kontrollerar SForms...",
        complete: "Kontroll klar",
        error: "Kontroll misslyckades",
        unexpectedError: "Ett oväntat fel uppstod under kontrollen",
        missingData: "Saknar information",
        missingDataDesc: "Licensnummer och region krävs för kontroll",
        status: "Status",
        holder: "Licensinnehavare",
        validFrom: "Giltig från",
        lastChecked: "Senast kontrollerad",
        statusActive: "Licensen är aktiv i regionalt register",
        statusInactive: "Licensen är inaktiv eller återkallad",
        statusNotFound: "Licensen hittades inte i registret",
        statusError: "Fel vid kontroll av licensstatus",
      },
      notFound: {
        title: "Fastighet hittades inte",
        description: "Ingen fastighet hittades som matchar dina sökkriterier. Vill du skapa en ny fastighetspost?",
      },
    },
    nationalLicense: {
      registrationNumber: "Registreringsnummer",
      holder: "Innehavare",
      expiresAt: "Utgår",
      status: {
        active: "Aktiv",
        pending: "Väntande",
        suspended: "Avstängd",
        cancelled: "Annullerad",
      },
      form: {
        title: "Nationell licensinformation",
        description: "Ange eller uppdatera den nationella hyresregistreringsinformationen för denna fastighet.",
        add: "Lägg till nationell licens",
        edit: "Redigera nationell licens",
        registrationNumber: "Registreringsnummer",
        status: "Status",
        holderName: "Innehavarens namn",
        holderNamePlaceholder: "Fullständigt juridiskt namn på licensinnehavare",
        registeredAt: "Registreringsdatum",
        expiresAt: "Utgångsdatum",
        notes: "Anteckningar",
        notesPlaceholder: "Ytterligare information eller verifieringsdetaljer",
        submit: "Spara licens",
        success: "Nationell licens sparad",
        successDesc: "Den nationella licensinformationen har uppdaterats framgångsrikt.",
        error: "Sparande misslyckades",
        unexpectedError: "Ett oväntat fel uppstod vid sparande av licensen.",
      },
    },
    identity: {
      swedish: {
        title: "Svensk identitetsverifiering",
        description: "Verifiera din svenska identitet",
      },
      spanish: {
        title: "Spansk identitetsverifiering",
        description: "Verifiera din spanska identitet",
      },
    },
    cases: {
      page: {
        title: "Verifieringsärenden",
        description: "Hantera verifieringsärenden",
      },
      create: "Skapa ärende",
      noCases: "Inga ärenden",
      noCasesDesc: "Du har inte skapat några verifieringsärenden än",
    },
    admin: {
      page: {
        title: "Adminpanel",
        description: "Granska och godkänn verifieringsförfrågningar",
      },
      noCases: "Inga väntande granskningar",
      noCasesDesc: "Alla verifieringsärenden har behandlats",
    },
    common: {
      error: "Fel",
      loading: "Laddar...",
    },
  },
  es: {
    nav: {
      home: "Inicio",
      verify: "Verificar",
      cases: "Casos",
      admin: "Admin",
      language: "Idioma",
    },
    home: {
      hero: {
        title: "Verificación de Alquileres Transfronterizos",
        subtitle: "Construyendo confianza en alquileres de propiedades españolas para usuarios suecos y españoles",
      },
      cta: {
        property: "Verificar propiedad",
        identity: "Verificar identidad",
      },
      feature: {
        property: {
          title: "Verificación de propiedad",
          description: "Validar licencias turísticas y cumplimiento legal",
        },
        identity: {
          title: "Verificación de identidad",
          description: "Verificación segura de identidad sueca y española",
        },
        ownership: {
          title: "Verificación de propiedad",
          description: "Hacer coincidir registros de propiedad con anfitriones verificados",
        },
      },
    },
    property: {
      search: {
        title: "Verificación de propiedad",
        description: "Ingrese los detalles de la propiedad para comenzar la verificación",
        cadastralRef: "Referencia catastral",
        cadastralRefPlaceholder: "ej. 1234567AB8901C",
        address: "Dirección",
        addressPlaceholder: "ej. Calle Mayor 1, Valencia",
        submit: "Buscar propiedad",
        searching: "Buscando...",
      },
      profile: {
        title: "Información de la propiedad",
        cadastralRef: "Referencia catastral",
        region: "Región",
        licenseNumber: "Número de licencia turística",
        nextStep: "Continuar verificación",
        status: {
          verified: "Verificado",
          pending: "Verificación pendiente",
          none: "Sin licencia",
        },
      },
      compliance: {
        title: "Resumen de cumplimiento",
        description: "Esta propiedad debe cumplir con los siguientes requisitos para operar legalmente como alquiler:",
        touristLicense: "Licencia turística",
        touristLicenseDesc: "Licencia regional válida de alojamiento turístico",
        nationalRegistration: "Registro Nacional (NRA)",
        nationalRegistrationDesc: "Registrado en el Registro Nacional de Alquileres (NRUA)",
        registration: "Registro de propiedad",
        registrationDesc: "Registrado con las autoridades locales",
      },
      spotCheck: {
        button: "Verificación en vivo",
        checking: "Consultando SForms...",
        complete: "Verificación completa",
        error: "Error en verificación",
        unexpectedError: "Ocurrió un error inesperado durante la verificación",
        missingData: "Falta información",
        missingDataDesc: "Se requiere número de licencia y región para la verificación",
        status: "Estado",
        holder: "Titular de la licencia",
        validFrom: "Válido desde",
        lastChecked: "Última verificación",
        statusActive: "La licencia está activa en el registro regional",
        statusInactive: "La licencia está inactiva o revocada",
        statusNotFound: "Licencia no encontrada en el registro",
        statusError: "Error al verificar el estado de la licencia",
      },
      notFound: {
        title: "Propiedad no encontrada",
        description: "No se encontró ninguna propiedad que coincida con sus criterios de búsqueda. ¿Le gustaría crear un nuevo registro de propiedad?",
      },
    },
    nationalLicense: {
      registrationNumber: "Número de registro",
      holder: "Titular",
      expiresAt: "Vence",
      status: {
        active: "Activo",
        pending: "Pendiente",
        suspended: "Suspendido",
        cancelled: "Cancelado",
      },
      form: {
        title: "Información de licencia nacional",
        description: "Ingrese o actualice los detalles del Registro Nacional de Alquileres para esta propiedad.",
        add: "Agregar licencia nacional",
        edit: "Editar licencia nacional",
        registrationNumber: "Número de registro",
        status: "Estado",
        holderName: "Nombre del titular",
        holderNamePlaceholder: "Nombre legal completo del titular de la licencia",
        registeredAt: "Fecha de registro",
        expiresAt: "Fecha de vencimiento",
        notes: "Notas",
        notesPlaceholder: "Información adicional o detalles de verificación",
        submit: "Guardar licencia",
        success: "Licencia nacional guardada",
        successDesc: "La información de la licencia nacional se ha actualizado correctamente.",
        error: "Error al guardar",
        unexpectedError: "Ocurrió un error inesperado al guardar la licencia.",
      },
    },
    identity: {
      swedish: {
        title: "Verificación de identidad sueca",
        description: "Verifique su identidad sueca",
      },
      spanish: {
        title: "Verificación de identidad española",
        description: "Verifique su identidad española",
      },
    },
    cases: {
      page: {
        title: "Casos de verificación",
        description: "Gestionar casos de verificación",
      },
      create: "Crear caso",
      noCases: "Sin casos",
      noCasesDesc: "Aún no has creado ningún caso de verificación",
    },
    admin: {
      page: {
        title: "Panel de administración",
        description: "Revisar y aprobar solicitudes de verificación",
      },
      noCases: "Sin revisiones pendientes",
      noCasesDesc: "Todos los casos de verificación han sido procesados",
    },
    common: {
      error: "Error",
      loading: "Cargando...",
    },
  },
};

export function getTranslation(locale: Locale, key: string): string {
  const keys = key.split(".");
  let value: any = translations[locale];
  
  for (const k of keys) {
    if (value && typeof value === "object" && k in value) {
      value = value[k];
    } else {
      return key;
    }
  }
  
  return typeof value === "string" ? value : key;
}