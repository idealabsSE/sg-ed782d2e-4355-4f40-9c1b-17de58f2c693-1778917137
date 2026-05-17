import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { PropertySearchForm } from "@/components/PropertySearchForm";
import { PropertyProfile } from "@/components/PropertyProfile";
import { PropertyNotFound } from "@/components/PropertyNotFound";
import { propertyService } from "@/properties/PropertyService";
import { Loader2 } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Property = Database["public"]["Tables"]["properties"]["Row"];

export function PropertyVerificationStep() {
  const { t } = useTranslation();
  const [searchResult, setSearchResult] = useState<"idle" | "loading" | "found" | "not-found">("idle");
  const [property, setProperty] = useState<Property | null>(null);

  const handleSearch = async (searchData: { address?: string; cadastralRef?: string }) => {
    setSearchResult("loading");
    
    const { data, error } = await propertyService.searchProperty({
      cadastralReference: searchData.cadastralRef,
      address: searchData.address,
    });

    console.log("Property search result:", { data, error });

    if (error || !data) {
      setSearchResult("not-found");
      setProperty(null);
    } else {
      setSearchResult("found");
      setProperty(data);
    }
  };

  const handleReset = () => {
    setSearchResult("idle");
    setProperty(null);
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl font-bold">{t("property.page.heading")}</h1>
        <p className="text-muted-foreground">
          {t("property.page.subheading")}
        </p>
      </div>

      {searchResult === "idle" && (
        <PropertySearchForm onSearch={handleSearch} />
      )}

      {searchResult === "loading" && (
        <div className="flex flex-col items-center justify-center py-12 space-y-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">{t("common.loading")}</p>
        </div>
      )}

      {searchResult === "found" && property && (
        <PropertyProfile property={property} />
      )}

      {searchResult === "not-found" && (
        <PropertyNotFound onReset={handleReset} />
      )}
    </div>
  );
}