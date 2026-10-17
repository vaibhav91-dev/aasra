import { Aasra } from "@/components/aasra";
import { ErrorBoundary } from "@/components/error-boundary";

export default function Page() {
  return (
    <ErrorBoundary>
      <Aasra />
    </ErrorBoundary>
  );
}
