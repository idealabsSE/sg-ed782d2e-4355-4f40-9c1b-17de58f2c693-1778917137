import { useTranslation } from "@/hooks/useTranslation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle } from "lucide-react";

interface PropertyNotFoundProps {
  onReset: () => void;
}

export function PropertyNotFound({ onReset }: PropertyNotFoundProps) {
  const { t } = useTranslation();

  return (
    <Card className="border-destructive/50">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-destructive/10 flex items-center justify-center">
            <AlertCircle className="h-6 w-6 text-destructive" />
          </div>
          <div>
            <CardTitle>{t("property.notFound.title")}</CardTitle>
            <CardDescription>{t("property.notFound.description")}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>{t("property.notFound.suggestions.title")}</p>
          <ul className="list-disc list-inside space-y-1 ml-4">
            <li>{t("property.notFound.suggestions.checkAddress")}</li>
            <li>{t("property.notFound.suggestions.cadastralFormat")}</li>
            <li>{t("property.notFound.suggestions.contact")}</li>
          </ul>
        </div>
        <Button onClick={onReset} variant="outline" className="w-full">
          {t("property.notFound.tryAgain")}
        </Button>
      </CardContent>
    </Card>
  );
}