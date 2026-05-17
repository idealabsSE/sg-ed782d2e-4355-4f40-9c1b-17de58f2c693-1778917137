import { useState } from "react";
import { useTranslation } from "@/hooks/useTranslation";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { PropertyVerificationStep } from "@/properties/ui/PropertyVerificationStep";
import { SwedishIdentityStep } from "@/swedishpersonverification/ui/SwedishIdentityStep";
import { SpanishIdentityStep } from "@/spanishpersonverification/ui/SpanishIdentityStep";
import { OwnershipStep } from "@/ownershipverification/ui/OwnershipStep";
import { ArrowLeft, ArrowRight } from "lucide-react";

type WizardStep = "property" | "identity" | "ownership";
type IdentityVariant = "swedish" | "spanish";

interface VerificationWizardProps {
  variant?: IdentityVariant;
}

export function VerificationWizard({ variant = "swedish" }: VerificationWizardProps) {
  const { t } = useTranslation();
  const [currentStep, setCurrentStep] = useState<WizardStep>("property");

  const steps: WizardStep[] = ["property", "identity", "ownership"];
  const currentStepIndex = steps.indexOf(currentStep);
  const progress = ((currentStepIndex + 1) / steps.length) * 100;

  const handleNextStep = () => {
    if (currentStep === "property") {
      setCurrentStep("identity");
    } else if (currentStep === "identity") {
      setCurrentStep("ownership");
    }
  };

  const handlePrevStep = () => {
    if (currentStep === "identity") {
      setCurrentStep("property");
    } else if (currentStep === "ownership") {
      setCurrentStep("identity");
    }
  };

  const canGoBack = currentStep !== "property";
  const canGoForward = currentStep !== "ownership";

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Progress Bar */}
      <div className="space-y-2">
        <Progress value={progress} className="h-2" />
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>
            {t("identity.wizard.step")} {currentStepIndex + 1} / {steps.length}
          </span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="flex justify-between text-sm">
          <span className={currentStep === "property" ? "font-semibold text-primary" : "text-muted-foreground"}>
            {t("property.page.heading")}
          </span>
          <span className={currentStep === "identity" ? "font-semibold text-primary" : "text-muted-foreground"}>
            {t("identity.documents.title")}
          </span>
          <span className={currentStep === "ownership" ? "font-semibold text-primary" : "text-muted-foreground"}>
            {t("ownership.page.heading")}
          </span>
        </div>
      </div>

      {/* Step Content */}
      <div className="min-h-[500px]">
        {currentStep === "property" && <PropertyVerificationStep />}
        
        {currentStep === "identity" && (
          variant === "spanish" ? <SpanishIdentityStep /> : <SwedishIdentityStep />
        )}
        
        {currentStep === "ownership" && <OwnershipStep />}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 pt-6 border-t">
        <Button
          onClick={handlePrevStep}
          disabled={!canGoBack}
          variant="outline"
          className="gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          {t("identity.wizard.back")}
        </Button>
        <Button
          onClick={handleNextStep}
          disabled={!canGoForward}
          className="flex-1 gap-2"
        >
          {t("identity.wizard.continue")}
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}