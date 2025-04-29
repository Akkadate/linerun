# วิธีการติดตั้งและใช้งาน LINE LIFF Running App

## ก่อนเริ่มต้น

ต้องมีสิ่งต่อไปนี้ก่อนเริ่มต้น:
- Node.js และ npm (เวอร์ชัน 14 ขึ้นไป)
- บัญชี LINE Developer
- บัญชี Supabase

## ขั้นตอนที่ 1: ตั้งค่าโปรเจกต์บน LINE Developer Console

1. ไปที่ [LINE Developers Console](https://developers.line.biz/console/)
2. สร้าง Provider ใหม่ (หรือใช้ Provider ที่มีอยู่แล้ว)
3. สร้าง Channel ใหม่ประเภท "LINE Login"
4. บันทึก Channel ID และ Channel Secret
5. ในแท็บ "LINE Login" ให้ตั้งค่าดังนี้:
   - Callback URL: `https://your-domain.com/running-app/` (หรือ URL ที่จะใช้)
   - Scope: `profile openid email`
6. ในแท็บ "LIFF" ให้สร้าง LIFF App ใหม่:
   - Size: Full
   - Endpoint URL: `https://your-domain.com/running-app/` (หรือ URL ที่จะใช้)
   - Scope: `profile openid email`
   - บันทึก LIFF ID ที่ได้

## ขั้นตอนที่ 2: ตั้งค่า Supabase

1. สมัครใช้งาน [Supabase](https://supabase.com/) และสร้างโปรเจคใหม่
2. นำ SQL จากไฟล์ `supabase-schema.sql` ไปรันบน SQL Editor ของ Supabase
3. บันทึก Supabase URL และ API Keys (anon key และ service_role key)
4. สร้าง Bucket ชื่อ "running_evidence" ใน Storage

## ขั้นตอนที่ 3: ตั้งค่า Backend

1. โคลนหรือสร้างโปรเจคตามโครงสร้างที่กำหนด
2. เข้าไปที่โฟลเดอร์ backend:
```bash
cd running-app-backend
```

3. ติดตั้ง dependencies:
```bash
npm install
```

4. สร้างไฟล์ `.env` และกำหนดค่าต่างๆ:
```
PORT=4800
SUPABASE_URL=your-supabase-url
SUPABASE_SERVICE_KEY=your-supabase-service-key
LINE_CHANNEL_ID=your-line-channel-id
LINE_CHANNEL_SECRET=your-line-channel-secret
JWT_SECRET=your-jwt-secret-for-api-tokens  # สร้างขึ้นเอง เช่น openssl rand -base64 32
CORS_ORIGIN=http://localhost:3250  # หรือโดเมนของ Frontend
```

5. เริ่มต้น Backend Server:
```bash
npm run dev
```
Backend จะทำงานที่ port 4800

## ขั้นตอนที่ 4: ตั้งค่า Frontend

1. เข้าไปที่โฟลเดอร์ frontend:
```bash
cd running-app-frontend
```

2. ติดตั้ง dependencies:
```bash
npm install
```

3. แก้ไข package.json เพื่อให้แอปทำงานที่ port 3250:
```json
"scripts": {
  "start": "PORT=3250 react-scripts start",
  ...
}
```

4. สร้างไฟล์ `.env` และกำหนดค่าต่างๆ:
```
REACT_APP_LIFF_ID=your-liff-id
REACT_APP_API_URL=http://localhost:4800/api
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

5. เริ่มต้น Frontend Server:
```bash
npm start
```
Frontend จะทำงานที่ port 3250

## ขั้นตอนที่ 5: ทดสอบแอปพลิเคชัน

1. เปิดเบราว์เซอร์และไปที่:
   - ทดสอบแบบ local: http://localhost:3250
   - หรือทดสอบผ่าน LIFF Browser: https://liff.line.me/your-liff-id

2. คุณจะเห็นหน้าแรกของแอปพลิเคชันซึ่งมีปุ่ม "เข้าสู่ระบบด้วย LINE"

3. เมื่อกดปุ่มจะเข้าสู่กระบวนการเข้าสู่ระบบด้วย LINE

## ขั้นตอนที่ 6: Deploy ขึ้น Production

### สำหรับ Frontend:

1. สร้าง build version:
```bash
npm run build
```

2. นำไฟล์ใน folder `build` ไป deploy บน web server ของคุณ (เช่น Netlify, Vercel, หรือ shared hosting)

### สำหรับ Backend:

1. ใช้บริการ Cloud เช่น AWS, Google Cloud, หรือ DigitalOcean
2. หรือใช้บริการเฉพาะสำหรับ Node.js เช่น Heroku, Render, หรือ Railway

## ขั้นตอนที่ 7: อัปเดต URL ใน LINE Developers Console

1. เมื่อ deploy เสร็จแล้ว ให้กลับไปที่ LINE Developers Console
2. อัปเดต Endpoint URL ของ LIFF App เป็น URL ของ Production
3. อัปเดต Callback URL ใน LINE Login settings เป็น URL ของ Production

## การแก้ไขปัญหา (Troubleshooting)

### ปัญหา: ไม่สามารถเข้าสู่ระบบด้วย LINE ได้
- ตรวจสอบ Channel ID และ LIFF ID ว่าถูกต้อง
- ตรวจสอบว่าได้เพิ่ม Endpoint URL และ Callback URL ที่ถูกต้องใน LINE Developer Console
- ตรวจสอบว่าได้ activate LINE Login ใน Channel

### ปัญหา: Frontend ไม่สามารถเชื่อมต่อ Backend ได้
- ตรวจสอบว่า Backend ทำงานอยู่
- ตรวจสอบ CORS settings ใน Backend
- ตรวจสอบ API URL ใน Frontend config

### ปัญหา: ไม่สามารถอัปโหลดรูปภาพได้
- ตรวจสอบการตั้งค่า Supabase Storage
- ตรวจสอบ permissions และ policies ใน Supabase Storage

### ปัญหา: ไม่สามารถบันทึกข้อมูลการวิ่งได้
- ตรวจสอบการเชื่อมต่อกับ Supabase Database
- ตรวจสอบ SQL schema ว่าถูกต้อง
- ตรวจสอบ API endpoint ว่าทำงานถูกต้อง (ใช้ tools เช่น Postman)
