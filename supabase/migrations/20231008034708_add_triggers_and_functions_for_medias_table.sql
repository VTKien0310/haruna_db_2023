set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_uploader_id_to_current_auth_user()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    NEW.uploader_id = auth.uid();
    RETURN NEW; 
END;$function$
;

CREATE TRIGGER set_uploader_id_to_current_auth_user BEFORE INSERT ON public.medias FOR EACH ROW EXECUTE FUNCTION set_uploader_id_to_current_auth_user();


