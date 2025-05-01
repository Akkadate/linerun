// src/index.js - แก้ไขเพื่อเริ่มต้น LIFF ก่อนเรนเดอร์แอพ
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import liff from '@line/liff';
import config from './config';

// เริ่มต้น LIFF ก่อนการเรนเดอร์แอพ
const root = ReactDOM.createRoot(document.getElementById('root'));

// แสดงหน้าโหลดก่อน
root.render(
  <div className="loading-screen">
    <div className="loading-logo">
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 36">
        <path fill="#06C755" d="M32 18c0-7.732-7.737-14-18-14S0 10.268 0 18c0 6.751 5.383 12.41 12.701 13.698c.805.241 1.606.363 2.398.363L14 29s-.319-1.356-.412-1.566c-.535-1.223-1.326-2.161-2.239-3.101c4.241 0 9.189-.747 10.805-2.534c1.387-1.525 1.95-3.097 1.95-4.93c0-1.833-.563-3.405-1.95-4.93C20.577 10.263 17.17 9.516 13.5 9.516S6.423 10.263 4.846 11.939c-1.387 1.525-1.95 3.097-1.95 4.93c0 1.833.563 3.405 1.95 4.93c.321.354.7.669 1.129.946a8.5 8.5 0 0 1-1.147-4.246A8.5 8.5 0 0 1 13.3 10.027c3.96 0 7.231 3.198 7.231 7.142c0 3.944-3.271 7.142-7.231 7.142c-.772 0-1.516-.121-2.214-.344c2.653.27 5.49.094 7.922-.57c2.371-.647 4.634-1.906 6.339-3.946C28.051 15.893 30 13.568 30 9.516h2C32 11.044 31.337 13.172 30 15c2 1.5 2 3 2 3z"/>
      </svg>
    </div>
    <div className="loading-spinner"></div>
  </div>
);

// เริ่มต้น LIFF
const initializeLiff = async () => {
  try {
    await liff.init({ liffId: config.liffId });
    console.log('LIFF initialized successfully');
    
    // เรนเดอร์แอพหลังจากเริ่มต้น LIFF เรียบร้อย
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  } catch (error) {
    console.error('LIFF initialization failed', error);
    
    // เรนเดอร์แอพแม้ว่าจะเริ่มต้น LIFF ไม่สำเร็จ
    root.render(
      <React.StrictMode>
        <App />
      </React.StrictMode>
    );
  }
};

initializeLiff();

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
