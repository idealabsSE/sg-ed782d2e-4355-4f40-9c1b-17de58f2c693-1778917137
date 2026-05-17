export type Locale = "en" | "sv" | "es";

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
    property: {
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
    property: {
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