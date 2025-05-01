// src/pages/HomePage.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/Loading';

const HomeContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  text-align: center;
`;

const WelcomeHeading = styled.h1`
  font-size: 2rem;
  margin-bottom: 1rem;
  color: var(--primary-color);
`;

const WelcomeText = styled.p`
  font-size: 1.1rem;
  margin-bottom: 2rem;
  max-width: 600px;
`;

const ActionButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 24px;
  padding: 0.75rem 2rem;
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #05a649;
  }
`;

const FeatureList = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1.5rem;
  margin-top: 3rem;
  width: 100%;
  max-width: 800px;
`;

const FeatureCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  width: 100%;
  max-width: 300px;
  text-align: center;
`;

const FeatureTitle = styled.h3`
  font-size: 1.2rem;
  margin-bottom: 0.5rem;
  color: var(--primary-color);
`;

const FeatureDescription = styled.p`
  font-size: 0.9rem;
  color: var(--text-color);
`;

const HomePage = () => {
  const { login, isAuthenticated, loading, currentUser } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to stats page if already logged in
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      navigate('/stats');
    }
  }, [isAuthenticated, currentUser, navigate]);
  
  if (loading) {
    return <Loading />;
  }
  
  const handleLoginClick = () => {
    login();
  };
  
  return (
    <HomeContainer>
      <WelcomeHeading>ยินดีต้อนรับสู่แอพบันทึกการวิ่ง</WelcomeHeading>
      <WelcomeText>
        บันทึกและติดตามระยะทางการวิ่งของคุณ แชร์ผลงาน และแข่งขันกับเพื่อนๆ
      </WelcomeText>
      
      <ActionButton onClick={handleLoginClick}>
        เข้าสู่ระบบด้วย LINE
      </ActionButton>
      
      <FeatureList>
        <FeatureCard>
          <FeatureTitle>บันทึกการวิ่ง</FeatureTitle>
          <FeatureDescription>
            บันทึกระยะทางการวิ่งและอัปโหลดภาพหลักฐานจากแอพนับระยะ
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>ติดตามความก้าวหน้า</FeatureTitle>
          <FeatureDescription>
            ดูสถิติส่วนตัว กราฟความก้าวหน้า และติดตามระยะทางสะสม
          </FeatureDescription>
        </FeatureCard>
        
        <FeatureCard>
          <FeatureTitle>แข่งขันกับเพื่อน</FeatureTitle>
          <FeatureDescription>
            ดูอันดับผู้วิ่งที่มีระยะทางมากที่สุดและแชร์ผลงานไปยัง LINE
          </FeatureDescription>
        </FeatureCard>
      </FeatureList>
    </HomeContainer>
  );
};

export default HomePage;
