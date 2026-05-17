import { SwedishIdentityStep } from "@/swedishpersonverification/ui/SwedishIdentityStep";
import { SpanishIdentityStep } from "@/spanishpersonverification/ui/SpanishIdentityStep";

interface VerificationWizardProps {
  variant?: "swedish" | "spanish";
}

export function VerificationWizard({ variant = "swedish" }: VerificationWizardProps) {
  if (variant === "spanish") {
    return <SpanishIdentityStep />;
  }

  return <SwedishIdentityStep />;
}