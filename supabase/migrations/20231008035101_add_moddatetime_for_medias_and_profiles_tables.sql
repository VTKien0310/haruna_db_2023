create extension if not exists "moddatetime" with schema "extensions";


CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.medias FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');

CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION moddatetime('updated_at');


