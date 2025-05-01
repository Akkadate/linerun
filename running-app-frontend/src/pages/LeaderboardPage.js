// src/pages/LeaderboardPage.js
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { leaderboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/Loading';

const PageContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const PageTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  text-align: center;
`;

const TabsContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 1.5rem;
`;

const Tab = styled.button`
  padding: 0.75rem 1.5rem;
  background-color: ${(props) => (props.active ? 'var(--primary-color)' : 'white')};
  color: ${(props) => (props.active ? 'white' : 'var(--text-color)')};
  border: 1px solid var(--border-color);
  border-radius: ${(props) => props.position === 'left' ? '8px 0 0 8px' : props.position === 'right' ? '0 8px 8px 0' : '0'};
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${(props) => props.active ? 'var(--primary-color)' : '#f0f0f0'};
  }
`;

const LeaderboardCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const LeaderboardTable = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 0.75rem;
    text-align: left;
    border-bottom: 1px solid var(--border-color);
  }
  
  th {
    font-weight: 600;
  }
  
  tr:last-child td {
    border-bottom: none;
  }
`;

const RankCell = styled.td`
  font-weight: 700;
  color: ${(props) => {
    if (props.rank === 1) return 'gold';
    if (props.rank === 2) return 'silver';
    if (props.rank === 3) return 'bronze';
    return 'inherit';
  }};
`;

const UserRow = styled.tr`
  background-color: ${(props) => props.isCurrentUser ? 'rgba(6, 199, 85, 0.1)' : 'transparent'};
`;

const ProfileCell = styled.td`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 2rem;
  color: #666;
`;

const ErrorState = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--error-color);
`;

const RefreshButton = styled.button`
  display: block;
  margin: 1rem auto;
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  
  &:hover {
    background-color: #05a649;
  }
`;

const LeaderboardPage = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState('daily');
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    fetchLeaderboard(activeTab);
  }, [activeTab]);
  
  const fetchLeaderboard = async (period) => {
    try {
      setLoading(true);
      setError(null);
      
      let data;
      switch (period) {
        case 'daily':
          data = await leaderboardAPI.getDailyLeaderboard();
          break;
        case 'weekly':
          data = await leaderboardAPI.getWeeklyLeaderboard();
          break;
        case 'monthly':
          data = await leaderboardAPI.getMonthlyLeaderboard();
          break;
        default:
          data = await leaderboardAPI.getDailyLeaderboard();
      }
      
      setLeaderboard(data);
    } catch (error) {
      console.error('Error fetching leaderboard:', error);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };
  
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };
  
  const handleRefresh = () => {
    fetchLeaderboard(activeTab);
  };
  
  const renderTabTitle = () => {
    switch (activeTab) {
      case 'daily':
        return 'อันดับประจำวัน';
      case 'weekly':
        return 'อันดับประจำสัปดาห์';
      case 'monthly':
        return 'อันดับประจำเดือน';
      default:
        return 'อันดับประจำวัน';
    }
  };
  
  if (loading) {
    return <Loading message="กำลังโหลดข้อมูล..." />;
  }
  
  return (
    <PageContainer>
      <PageTitle>{renderTabTitle()}</PageTitle>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'daily'} 
          onClick={() => handleTabChange('daily')}
          position="left"
        >
          รายวัน
        </Tab>
        <Tab 
          active={activeTab === 'weekly'} 
          onClick={() => handleTabChange('weekly')}
          position="middle"
        >
          รายสัปดาห์
        </Tab>
        <Tab 
          active={activeTab === 'monthly'} 
          onClick={() => handleTabChange('monthly')}
          position="right"
        >
          รายเดือน
        </Tab>
      </TabsContainer>
      
      <LeaderboardCard>
        {error ? (
          <ErrorState>
            <p>{error}</p>
            <RefreshButton onClick={handleRefresh}>ลองใหม่อีกครั้ง</RefreshButton>
          </ErrorState>
        ) : leaderboard.length === 0 ? (
          <EmptyState>
            <p>ยังไม่มีข้อมูลสำหรับช่วงเวลานี้</p>
          </EmptyState>
        ) : (
          <LeaderboardTable>
            <Table>
              <thead>
                <tr>
                  <th>อันดับ</th>
                  <th>ผู้ใช้</th>
                  <th>ระยะทางรวม (กม.)</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((item, index) => (
                  <UserRow 
                    key={item.user_id} 
                    isCurrentUser={currentUser && item.user_id === currentUser.id}
                  >
                    <RankCell rank={index + 1}>{index + 1}</RankCell>
                    <ProfileCell>
                      {item.profile_picture && (
                        <ProfileImage 
                          src={item.profile_picture} 
                          alt={item.display_name} 
                        />
                      )}
                      <span>{item.display_name}</span>
                    </ProfileCell>
                    <td>{item.total_distance.toFixed(2)}</td>
                  </UserRow>
                ))}
              </tbody>
            </Table>
          </LeaderboardTable>
        )}
      </LeaderboardCard>
      
      <RefreshButton onClick={handleRefresh}>รีเฟรชข้อมูล</RefreshButton>
    </PageContainer>
  );
};

export default LeaderboardPage;
