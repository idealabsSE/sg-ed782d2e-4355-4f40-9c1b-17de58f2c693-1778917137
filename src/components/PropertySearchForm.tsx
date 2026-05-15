import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";

interface PropertySearchFormProps {
  onSearch: (searchData: { address?: string; cadastralRef?: string }) => void;
}

export function PropertySearchForm({ onSearch }: PropertySearchFormProps) {
  const { t } = useTranslation();
  const [address, setAddress] = useState("");
  const [cadastralRef, setCadastralRef] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({ address, cadastralRef });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("property.search.title")}</CardTitle>
        <CardDescription>{t("property.search.description")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="address">{t("property.search.address")}</Label>
            <Input
              id="address"
              type="text"
              placeholder={t("property.search.addressPlaceholder")}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="text-center text-sm text-muted-foreground">
            {t("property.search.or")}
          </div>

          <div className="space-y-2">
            <Label htmlFor="cadastralRef">{t("property.search.cadastralRef")}</Label>
            <Input
              id="cadastralRef"
              type="text"
              placeholder="1234567AB1234S0001AB"
              value={cadastralRef}
              onChange={(e) => setCadastralRef(e.target.value)}
              className="font-mono"
            />
            <p className="text-xs text-muted-foreground">
              {t("property.search.cadastralHelp")}
            </p>
          </div>

          <Button 
            type="submit" 
            className="w-full gap-2" 
            disabled={!address && !cadastralRef}
          >
            <Search className="h-4 w-4" />
            {t("property.search.submit")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}