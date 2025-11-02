set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_owner_id_to_current_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
  NEW.owner_id = (SELECT auth.uid());
RETURN NEW;
END;$function$
;

CREATE TRIGGER set_owner_id_to_current_auth_user BEFORE INSERT ON public.webpage_bookmarks FOR EACH ROW EXECUTE FUNCTION set_owner_id_to_current_auth_user();


