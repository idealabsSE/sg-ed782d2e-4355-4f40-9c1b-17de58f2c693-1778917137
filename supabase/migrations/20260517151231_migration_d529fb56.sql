-- Drop the problematic policy
DROP POLICY IF EXISTS select_related_parties ON case_parties;

-- Recreate without the circular self-reference
-- Users can see case_parties if they created the case OR if they are directly listed as user_id
CREATE POLICY select_related_parties ON case_parties
  FOR SELECT
  USING (
    (user_id = auth.uid()) OR 
    (EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = case_parties.case_id 
      AND cases.created_by = auth.uid()
    ))
  );