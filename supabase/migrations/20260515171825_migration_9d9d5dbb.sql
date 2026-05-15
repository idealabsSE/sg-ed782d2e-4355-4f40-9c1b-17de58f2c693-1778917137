-- Enable RLS on all tables
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE cases ENABLE ROW LEVEL SECURITY;
ALTER TABLE case_parties ENABLE ROW LEVEL SECURITY;
ALTER TABLE ownership_documents ENABLE ROW LEVEL SECURITY;

-- Properties: T2 (Public read, authenticated write)
CREATE POLICY "public_read_properties" ON properties FOR SELECT USING (true);
CREATE POLICY "auth_insert_properties" ON properties FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "auth_update_properties" ON properties FOR UPDATE USING (auth.uid() IS NOT NULL);

-- Verifications: T1 (Private user data - strictly confidential)
CREATE POLICY "select_own_verifications" ON verifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "insert_own_verifications" ON verifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "update_own_verifications" ON verifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "delete_own_verifications" ON verifications FOR DELETE USING (auth.uid() = user_id);

-- Cases: Users can see cases they created OR cases where they are a party
CREATE POLICY "select_related_cases" ON cases FOR SELECT 
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM case_parties 
      WHERE case_parties.case_id = cases.id 
      AND case_parties.user_id = auth.uid()
    )
  );
CREATE POLICY "auth_insert_cases" ON cases FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "update_own_cases" ON cases FOR UPDATE 
  USING (
    auth.uid() = created_by OR 
    EXISTS (
      SELECT 1 FROM case_parties 
      WHERE case_parties.case_id = cases.id 
      AND case_parties.user_id = auth.uid()
    )
  );

-- Case Parties: Users can see parties for cases they are involved in
CREATE POLICY "select_related_parties" ON case_parties FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM case_parties cp 
      WHERE cp.case_id = case_parties.case_id 
      AND cp.user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = case_parties.case_id 
      AND cases.created_by = auth.uid()
    )
  );
CREATE POLICY "auth_insert_parties" ON case_parties FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "update_related_parties" ON case_parties FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM cases 
      WHERE cases.id = case_parties.case_id 
      AND cases.created_by = auth.uid()
    )
  );

-- Ownership Documents: Users see their own uploads + docs for properties in their cases
CREATE POLICY "select_own_ownership_docs" ON ownership_documents FOR SELECT 
  USING (
    auth.uid() = uploaded_by OR
    EXISTS (
      SELECT 1 FROM cases c
      JOIN case_parties cp ON cp.case_id = c.id
      WHERE c.property_id = ownership_documents.property_id
      AND cp.user_id = auth.uid()
    )
  );
CREATE POLICY "insert_own_ownership_docs" ON ownership_documents FOR INSERT WITH CHECK (auth.uid() = uploaded_by);
CREATE POLICY "update_own_ownership_docs" ON ownership_documents FOR UPDATE USING (auth.uid() = uploaded_by);