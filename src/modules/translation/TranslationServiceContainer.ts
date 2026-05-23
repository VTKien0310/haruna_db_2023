import { TranslationService } from "@/modules/translation/TranslationService";
import { backendPort } from "@/ports/backend/BackendPort";
import { useToastService } from "@/modules/master/MasterServiceContainer";

const useTranslationService = () =>
  new TranslationService(backendPort, useToastService());

export { useTranslationService };
