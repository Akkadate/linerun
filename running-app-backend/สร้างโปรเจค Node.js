# สร้างโปรเจค Node.js
mkdir running-app-backend
cd running-app-backend
npm init -y

# ปรับ package.json โดยเพิ่ม "type": "module" เพื่อใช้ ES Modules
# และเพิ่ม scripts:
# "start": "node src/app.js",
# "dev": "nodemon src/app.js"

# ติดตั้ง dependencies
npm install express
npm install cors
npm install dotenv
npm install jsonwebtoken
npm install axios
npm install @supabase/supabase-js
npm install multer
npm install uuid
npm install express-validator
npm install helmet
npm install morgan

# ติดตั้ง development dependencies
npm install --save-dev nodemon
