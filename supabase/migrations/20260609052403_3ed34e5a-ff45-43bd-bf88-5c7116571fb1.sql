ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read on platform_stats topic"
ON realtime.messages
FOR SELECT
TO authenticated, anon
USING (
  (realtime.topic() = 'platform_stats')
  AND (extension IN ('postgres_changes', 'presence', 'broadcast'))
);