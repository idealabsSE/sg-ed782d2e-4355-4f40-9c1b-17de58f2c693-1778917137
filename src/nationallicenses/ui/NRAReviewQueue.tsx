/**
 * NRA Review Queue Component
 * 
 * Internal admin interface for reviewing and confirming manually entered NRA registrations.
 * Only accessible to admin/reviewer roles.
 */

import { useState, useEffect } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { nationalLicenseService } from "@/nationallicenses/NationalLicenseService";
import { useAuth } from "@/contexts/AuthContext";
import { CheckCircle, Loader2, AlertCircle } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type NationalLicense = Database["public"]["Tables"]["national_licenses"]["Row"];

export function NRAReviewQueue() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const { user } = useAuth();
  const [pendingReviews, setPendingReviews] = useState<NationalLicense[]>([]);
  const [loading, setLoading] = useState(true);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  useEffect(() => {
    loadPendingReviews();
  }, []);

  const loadPendingReviews = async () => {
    setLoading(true);
    try {
      const { data, error } = await nationalLicenseService.getPendingReviews();

      if (error) {
        toast({
          title: t("nraReview.loadError"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      setPendingReviews(data || []);
    } catch (err) {
      toast({
        title: t("nraReview.loadError"),
        description: t("nraReview.unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = async (propertyId: string) => {
    if (!user?.id) {
      toast({
        title: t("nraReview.authRequired"),
        description: t("nraReview.authRequiredDesc"),
        variant: "destructive",
      });
      return;
    }

    setConfirmingId(propertyId);
    try {
      const { error } = await nationalLicenseService.confirmManualEntry(
        propertyId,
        user.id
      );

      if (error) {
        toast({
          title: t("nraReview.confirmError"),
          description: error.message,
          variant: "destructive",
        });
        return;
      }

      toast({
        title: t("nraReview.confirmSuccess"),
        description: t("nraReview.confirmSuccessDesc"),
      });

      // Reload the queue
      loadPendingReviews();
    } catch (err) {
      toast({
        title: t("nraReview.confirmError"),
        description: t("nraReview.unexpectedError"),
        variant: "destructive",
      });
    } finally {
      setConfirmingId(null);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {t("nraReview.title")}
          {pendingReviews.length > 0 && (
            <Badge variant="secondary">{pendingReviews.length}</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {pendingReviews.length === 0 ? (
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>{t("nraReview.noReviews")}</AlertDescription>
          </Alert>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("nraReview.property")}</TableHead>
                  <TableHead>{t("nraReview.registrationNumber")}</TableHead>
                  <TableHead>{t("nraReview.holderName")}</TableHead>
                  <TableHead>{t("nraReview.submittedAt")}</TableHead>
                  <TableHead>{t("nraReview.notes")}</TableHead>
                  <TableHead className="text-right">{t("nraReview.actions")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pendingReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell className="font-medium">
                      {(review as any).properties?.address || review.property_id}
                    </TableCell>
                    <TableCell>
                      <code className="rounded bg-muted px-2 py-1 text-sm">
                        {review.registration_number}
                      </code>
                    </TableCell>
                    <TableCell>{review.holder_name || "-"}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {new Date(review.created_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="max-w-xs truncate text-sm">
                      {review.notes || "-"}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        size="sm"
                        onClick={() => handleConfirm(review.property_id)}
                        disabled={confirmingId === review.property_id}
                        className="gap-2"
                      >
                        {confirmingId === review.property_id ? (
                          <Loader2 className="h-4 w-4 animate-spin" />
                        ) : (
                          <CheckCircle className="h-4 w-4" />
                        )}
                        {t("nraReview.confirm")}
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}