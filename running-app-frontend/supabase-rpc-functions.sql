-- ฟังก์ชัน RPC สำหรับรับระยะทางรวมทั้งหมดของผู้ใช้
CREATE OR REPLACE FUNCTION get_total_distance(user_id_param UUID)
RETURNS DECIMAL AS $$
DECLARE
  total_distance DECIMAL;
BEGIN
  SELECT COALESCE(SUM(distance), 0)
  INTO total_distance
  FROM running_records
  WHERE user_id = user_id_param;
  
  RETURN total_distance;
END;
$$ LANGUAGE plpgsql;

-- ฟังก์ชัน RPC สำหรับรับระยะทางสะสมรายสัปดาห์
CREATE OR REPLACE FUNCTION get_weekly_distance(user_id_param UUID)
RETURNS TABLE (
  week_number INTEGER,
  week_start DATE,
  total_distance DECIMAL
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    EXTRACT(WEEK FROM r.run_date)::INTEGER AS week_number,
    date_trunc('week', r.run_date)::DATE AS week_start,
    SUM(r.distance) AS total_distance
  FROM 
    running_records r
  WHERE 
    r.user_id = user_id_param
    AND r.run_date >= date_trunc('week', CURRENT_DATE - INTERVAL '12 weeks')
  GROUP BY 
    week_number, week_start
  ORDER BY 
    week_start DESC
  LIMIT 12;
END;
$$ LANGUAGE plpgsql;
