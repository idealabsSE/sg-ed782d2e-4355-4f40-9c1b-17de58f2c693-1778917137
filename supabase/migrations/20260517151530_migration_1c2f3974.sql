-- Drop and recreate the case_parties SELECT policy without the circular reference
DROP POLICY IF EXISTS select_related_parties ON case_parties;

-- Simplified policy: only check if user is directly a party (no backreference to cases)
CREATE POLICY select_related_parties ON case_parties
  FOR SELECT
  USING (user_id = auth.uid());