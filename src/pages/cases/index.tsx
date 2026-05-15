import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Building, Users, CheckCircle, Clock, AlertCircle } from "lucide-react";
import Link from "next/link";

interface CaseItem {
  id: string;
  property: {
    address: string;
    cadastralRef: string;
  };
  parties: {
    role: "tenant" | "host";
    name: string;
    email: string;
    status: "pending" | "verified" | "flagged";
  }[];
  createdAt: string;
  status: "active" | "complete" | "flagged";
}

const mockCases: CaseItem[] = [
  {
    id: "CASE-2024-001",
    property: {
      address: "Carrer de la Marina, 156, Barcelona",
      cadastralRef: "9872023VG1797N0001WX",
    },
    parties: [
      { role: "tenant", name: "Erik Andersson", email: "erik@example.se", status: "verified" },
      { role: "host", name: "María González", email: "maria@example.es", status: "pending" },
    ],
    createdAt: "2024-05-10",
    status: "active",
  },
  {
    id: "CASE-2024-002",
    property: {
      address: "Calle Gran Vía, 28, Madrid",
      cadastralRef: "1234567AB8901C0001DE",
    },
    parties: [
      { role: "tenant", name: "Anna Svensson", email: "anna@example.se", status: "verified" },
      { role: "host", name: "Carlos Ruiz", email: "carlos@example.es", status: "verified" },
    ],
    createdAt: "2024-05-08",
    status: "complete",
  },
];

export default function CasesPage() {
  const { t } = useTranslation();
  const [cases] = useState<CaseItem[]>(mockCases);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "verified":
        return <CheckCircle className="h-4 w-4" />;
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "flagged":
        return <AlertCircle className="h-4 w-4" />;
      default:
        return <Clock className="h-4 w-4" />;
    }
  };

  const getStatusVariant = (status: string): "default" | "secondary" | "destructive" => {
    switch (status) {
      case "verified":
        return "default";
      case "pending":
        return "secondary";
      case "flagged":
        return "destructive";
      default:
        return "secondary";
    }
  };

  return (
    <>
      <SEO
        title={t("cases.page.title")}
        description={t("cases.page.description")}
      />
      <div className="container py-12">
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">{t("cases.page.heading")}</h1>
              <p className="text-muted-foreground mt-2">
                {t("cases.page.subheading")}
              </p>
            </div>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              {t("cases.create")}
            </Button>
          </div>

          <div className="grid gap-6">
            {cases.map((caseItem) => (
              <Card key={caseItem.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <CardTitle className="flex items-center gap-2">
                        <span className="font-mono text-base">{caseItem.id}</span>
                        <Badge
                          variant={caseItem.status === "complete" ? "default" : caseItem.status === "flagged" ? "destructive" : "secondary"}
                          className={caseItem.status === "complete" ? "bg-accent" : ""}
                        >
                          {caseItem.status}
                        </Badge>
                      </CardTitle>
                      <CardDescription>
                        {t("cases.created")}: {new Date(caseItem.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex items-start gap-3 p-4 bg-muted rounded-lg">
                    <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div className="flex-1 space-y-1">
                      <p className="font-medium">{caseItem.property.address}</p>
                      <p className="text-sm text-muted-foreground font-mono data-value">
                        {caseItem.property.cadastralRef}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <Users className="h-4 w-4" />
                      {t("cases.parties")}
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      {caseItem.parties.map((party, index) => (
                        <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                          <div className="flex-1 space-y-1">
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="capitalize">
                                {party.role}
                              </Badge>
                              <Badge variant={getStatusVariant(party.status)} className={party.status === "verified" ? "bg-accent" : ""}>
                                {getStatusIcon(party.status)}
                                <span className="ml-1 capitalize">{party.status}</span>
                              </Badge>
                            </div>
                            <p className="font-medium">{party.name}</p>
                            <p className="text-sm text-muted-foreground">{party.email}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <Link href={`/cases/${caseItem.id}`}>
                      <Button variant="outline">
                        {t("cases.viewDetails")}
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}