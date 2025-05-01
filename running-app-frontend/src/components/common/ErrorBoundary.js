// สร้างไฟล์ src/components/common/ErrorBoundary.js
import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ error, errorInfo });
    console.error("Component error:", error);
    console.error("Error stack:", errorInfo.componentStack);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '20px', backgroundColor: '#fff4f4', borderRadius: '8px', margin: '20px' }}>
          <h2>เกิดข้อผิดพลาด</h2>
          <p>กรุณารีเฟรชหน้านี้หรือกลับไปยังหน้าหลัก</p>
          <details style={{ whiteSpace: 'pre-wrap' }}>
            <summary>รายละเอียดข้อผิดพลาด</summary>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo && this.state.errorInfo.componentStack}
          </details>
          <button 
            onClick={() => window.location.href = '/'} 
            style={{ 
              marginTop: '10px',
              padding: '8px 16px',
              backgroundColor: '#06c755',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            กลับไปหน้าหลัก
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
