-- Fix the function by adding an explicit search_path setting
CREATE OR REPLACE FUNCTION public.set_uploader_id_to_current_auth_user()
  RETURNS trigger
  LANGUAGE plpgsql
  SECURITY DEFINER
  SET search_path = '' -- Adding this line fixes the issue
AS $$
BEGIN
  NEW.uploader_id = (SELECT auth.uid());
RETURN NEW;
END;
$$;
