-- Fix the UPDATE policy without using the non-existent role() function
DROP POLICY IF EXISTS update_related_parties ON case_parties;

CREATE POLICY update_related_parties ON case_parties
  FOR UPDATE
  USING (user_id = auth.uid());