import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { SEO } from "@/components/SEO";
import { PropertySearchForm } from "@/components/PropertySearchForm";
import { PropertyProfile } from "@/components/PropertyProfile";
import { PropertyNotFound } from "@/components/PropertyNotFound";

export default function PropertyVerification() {
  const { t } = useTranslation();
  const [searchResult, setSearchResult] = useState<"idle" | "found" | "not-found">("idle");

  const handleSearch = (searchData: { address?: string; cadastralRef?: string }) => {
    // Mock search logic - in production, this would call an API
    const mockSuccess = searchData.address?.toLowerCase().includes("valencia") || 
                        searchData.cadastralRef?.length === 20;
    
    setSearchResult(mockSuccess ? "found" : "not-found");
  };

  const handleReset = () => {
    setSearchResult("idle");
  };

  // Mock property data for demonstration
  const mockProperty = {
    address: "Carrer de Colón 23, 46004 Valencia",
    cadastralRef: "4609511YJ2740N0001KL",
    municipality: "Valencia",
    province: "Valencia",
    licenseStatus: "verified" as const,
    licenseNumber: "VLC-AT-2024-0123",
    propertyType: t("property.types.apartment"),
  };

  return (
    <>
      <SEO
        title={t("property.page.title")}
        description={t("property.page.description")}
      />
      <div className="container py-12">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold">{t("property.page.heading")}</h1>
            <p className="text-muted-foreground">
              {t("property.page.subheading")}
            </p>
          </div>

          {searchResult === "idle" && (
            <PropertySearchForm onSearch={handleSearch} />
          )}

          {searchResult === "found" && (
            <PropertyProfile property={mockProperty} />
          )}

          {searchResult === "not-found" && (
            <PropertyNotFound onReset={handleReset} />
          )}
        </div>
      </div>
    </>
  );
}