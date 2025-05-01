-- ตารางผู้ใช้
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  line_id VARCHAR NOT NULL UNIQUE,
  display_name VARCHAR NOT NULL,
  profile_picture TEXT,
  phone_number VARCHAR,
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ตารางบันทึกการวิ่ง
CREATE TABLE running_records (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  run_date DATE NOT NULL,
  distance DECIMAL(10, 2) NOT NULL, -- ระยะทางในกิโลเมตร
  duration INTEGER, -- เวลาที่ใช้ในวินาที (optional)
  evidence_image_url TEXT, -- URL ของภาพหลักฐาน
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ดัชนีเพื่อเพิ่มประสิทธิภาพการค้นหา
CREATE INDEX idx_running_records_user_id ON running_records(user_id);
CREATE INDEX idx_running_records_run_date ON running_records(run_date);

-- ตั้งค่า Storage 
-- สร้าง bucket สำหรับเก็บรูปภาพหลักฐาน
INSERT INTO storage.buckets (id, name, public) VALUES ('running_evidence', 'running_evidence', true);

-- อนุญาตให้ผู้ใช้งานอัปโหลดไฟล์ได้ (ควรตั้งค่า policies ตามความเหมาะสม)
CREATE POLICY "Allow authenticated users to upload files" 
  ON storage.objects FOR INSERT 
  TO authenticated 
  WITH CHECK (bucket_id = 'running_evidence');

CREATE POLICY "Allow authenticated users to read their own files" 
  ON storage.objects FOR SELECT 
  TO authenticated 
  USING (bucket_id = 'running_evidence');

-- วิวสำหรับ Leaderboard รายวัน
CREATE VIEW daily_leaderboard AS
SELECT 
  u.id as user_id,
  u.display_name,
  u.profile_picture,
  rr.run_date,
  SUM(rr.distance) as total_distance
FROM 
  users u
JOIN 
  running_records rr ON u.id = rr.user_id
WHERE 
  rr.run_date = CURRENT_DATE
GROUP BY 
  u.id, u.display_name, u.profile_picture, rr.run_date
ORDER BY 
  total_distance DESC;

-- วิวสำหรับ Leaderboard รายสัปดาห์
CREATE VIEW weekly_leaderboard AS
SELECT 
  u.id as user_id,
  u.display_name,
  u.profile_picture,
  date_trunc('week', rr.run_date) as week_start,
  SUM(rr.distance) as total_distance
FROM 
  users u
JOIN 
  running_records rr ON u.id = rr.user_id
WHERE 
  rr.run_date BETWEEN date_trunc('week', CURRENT_DATE) AND CURRENT_DATE
GROUP BY 
  u.id, u.display_name, u.profile_picture, week_start
ORDER BY 
  total_distance DESC;

-- วิวสำหรับ Leaderboard รายเดือน
CREATE VIEW monthly_leaderboard AS
SELECT 
  u.id as user_id,
  u.display_name,
  u.profile_picture,
  date_trunc('month', rr.run_date) as month_start,
  SUM(rr.distance) as total_distance
FROM 
  users u
JOIN 
  running_records rr ON u.id = rr.user_id
WHERE 
  rr.run_date BETWEEN date_trunc('month', CURRENT_DATE) AND CURRENT_DATE
GROUP BY 
  u.id, u.display_name, u.profile_picture, month_start
ORDER BY 
  total_distance DESC;
