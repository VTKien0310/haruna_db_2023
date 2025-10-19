set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.set_root_id_to_id()
 RETURNS trigger
 LANGUAGE plpgsql
AS $function$BEGIN
    IF NEW.level = 0 THEN
        NEW.root_id := NEW.id;
    END IF;
    RETURN NEW;
END;$function$
;

CREATE TRIGGER set_root_id_to_id BEFORE INSERT ON public.webpage_bookmarks FOR EACH ROW EXECUTE FUNCTION set_root_id_to_id();


