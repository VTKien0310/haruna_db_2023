import { CreateWebpageBookmarkService } from "@/modules/webpage-bookmark/services/CreateWebpageBookmarkService.ts";
import { supabasePort } from "@/ports/supabase/SupabasePort.ts";
import { useToastService } from "@/modules/master/MasterServiceContainer.ts";

const useCreateWebpageBookmarkService = () =>
  new CreateWebpageBookmarkService(supabasePort, useToastService());

export { useCreateWebpageBookmarkService };
