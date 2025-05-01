// src/pages/StatsPage.js
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { runningAPI, leaderboardAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { useLiff } from '../services/liff';
import Loading from '../components/common/Loading';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 2rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: var(--text-color);
`;

const ChartCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const ChartTitle = styled.h3`
  font-size: 1.2rem;
  color: var(--text-color);
  margin-bottom: 1rem;
  text-align: center;
`;

const RecordsTable = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
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

const RankBadge = styled.span`
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 16px;
  background-color: ${props => {
    if (props.rank === 1) return 'gold';
    if (props.rank === 2) return 'silver';
    if (props.rank === 3) return 'bronze';
    return '#f0f0f0';
  }};
  color: ${props => (props.rank <= 3 ? 'white' : 'var(--text-color)')};
  font-weight: 600;
  font-size: 0.875rem;
`;

const ActionButton = styled(Link)`
  display: block;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 24px;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  text-align: center;
  text-decoration: none;
  
  &:hover {
    background-color: #05a649;
  }
`;

const ShareButton = styled.button`
  display: block;
  width: 100%;
  background-color: #06c755;
  color: white;
  border: none;
  border-radius: 24px;
  padding: 0.75rem;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.3s ease;
  margin-top: 1rem;
  
  &:hover {
    background-color: #05a649;
  }
`;

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const StatsPage = () => {
  const { currentUser, loading: authLoading } = useAuth();
  const { shareMessage } = useLiff();
  const [stats, setStats] = useState(null);
  const [records, setRecords] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
 // เพิ่มใน useEffect ของ StatsPage.js
useEffect(() => {
  const fetchData = async () => {
    console.log('Attempting to fetch stats data...');
    try {
      setLoading(true);
      
      // Fetch user stats
      console.log('Fetching user stats...');
      const statsData = await runningAPI.getUserStats();
      console.log('Stats data received:', statsData);
      setStats(statsData);
      
      // Fetch running records
      console.log('Fetching running records...');
      const recordsData = await runningAPI.getRunningRecords({ limit: 10 });
      console.log('Records data received:', recordsData);
      setRecords(recordsData.records);
      
      // Fetch user rank
      console.log('Fetching user rank...');
      const rankData = await leaderboardAPI.getUserRank('monthly');
      console.log('Rank data received:', rankData);
      setUserRank(rankData);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setError('ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง');
    } finally {
      setLoading(false);
    }
  };
  
  fetchData();
}, []);
  
  const handleShare = async () => {
    if (!stats) return;
    
    const text = `
🏃‍♂️ สรุปผลการวิ่งของฉันประจำเดือนนี้ 🏃‍♀️
ระยะทางรวม: ${stats.totalDistance.toFixed(2)} กม.
ระยะทางเฉลี่ยต่อวัน: ${stats.averageDistance.toFixed(2)} กม.
จำนวนวันที่วิ่ง: ${stats.daysCount} วัน
${userRank ? `อันดับประจำเดือนนี้: อันดับที่ ${userRank.rank}` : ''}
#LINERunning
    `;
    
    try {
      await shareMessage(text);
    } catch (error) {
      console.error('Error sharing message:', error);
      alert('ไม่สามารถแชร์ข้อความได้ กรุณาลองใหม่อีกครั้ง');
    }
  };
  
  if (authLoading || loading) {
    return <Loading message="กำลังโหลดข้อมูล..." />;
  }
  
  if (error) {
    return (
      <PageContainer>
        <div style={{ textAlign: 'center', color: 'var(--error-color)' }}>
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            style={{ marginTop: '1rem' }}
            className="btn"
          >
            ลองใหม่อีกครั้ง
          </button>
        </div>
      </PageContainer>
    );
  }
  
  // Prepare chart data
  const prepareChartData = () => {
    if (!stats || !stats.dailyDistance || stats.dailyDistance.length === 0) {
      return {
        dailyLabels: [],
        dailyData: [],
        weeklyLabels: [],
        weeklyData: []
      };
    }
    
    // Sort daily data by date
    const sortedDailyData = [...stats.dailyDistance].sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    // Extract labels and data for daily chart
    const dailyLabels = sortedDailyData.map(item => 
      formatDate(item.date)
    ).slice(-14); // Show last 14 days
    
    const dailyData = sortedDailyData.map(item => 
      item.distance
    ).slice(-14); // Show last 14 days
    
    // Extract labels and data for weekly chart
    const weeklyLabels = stats.weeklyDistance.map(item => 
      `สัปดาห์ที่ ${item.weekNumber}`
    );
    
    const weeklyData = stats.weeklyDistance.map(item => 
      item.totalDistance
    );
    
    return {
      dailyLabels,
      dailyData,
      weeklyLabels,
      weeklyData
    };
  };
  
  const { dailyLabels, dailyData, weeklyLabels, weeklyData } = prepareChartData();
  
  // Daily chart options and data
  const dailyChartData = {
    labels: dailyLabels,
    datasets: [
      {
        label: 'ระยะทาง (กม.)',
        data: dailyData,
        fill: true,
        backgroundColor: 'rgba(6, 199, 85, 0.1)',
        borderColor: 'rgba(6, 199, 85, 1)',
        tension: 0.4
      }
    ]
  };
  
  const dailyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'ระยะทาง (กม.)'
        }
      }
    }
  };
  
  // Weekly chart options and data
  const weeklyChartData = {
    labels: weeklyLabels,
    datasets: [
      {
        label: 'ระยะทางรวม (กม.)',
        data: weeklyData,
        backgroundColor: 'rgba(6, 199, 85, 0.7)',
        borderWidth: 1
      }
    ]
  };
  
  const weeklyChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        position: 'top'
      },
      title: {
        display: false
      }
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'ระยะทางรวม (กม.)'
        }
      }
    }
  };
  
  return (
    <PageContainer>
      <PageTitle>สถิติการวิ่งของคุณ</PageTitle>
      
      {stats && (
        <>
          <StatsGrid>
            <StatCard>
              <StatValue>{stats.totalDistance.toFixed(2)}</StatValue>
              <StatLabel>ระยะทางรวม (กม.)</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{stats.averageDistance.toFixed(2)}</StatValue>
              <StatLabel>ระยะทางเฉลี่ยต่อวัน (กม.)</StatLabel>
            </StatCard>
            
            <StatCard>
              <StatValue>{stats.daysCount}</StatValue>
              <StatLabel>จำนวนวันที่วิ่ง</StatLabel>
            </StatCard>
            
            {userRank && (
              <StatCard>
                <StatValue>
                  <RankBadge rank={userRank.rank}>{userRank.rank}</RankBadge>
                </StatValue>
                <StatLabel>อันดับประจำเดือนนี้</StatLabel>
              </StatCard>
            )}
          </StatsGrid>
          
          <ChartCard>
            <ChartTitle>ระยะทางการวิ่งรายวัน (14 วันล่าสุด)</ChartTitle>
            <Line data={dailyChartData} options={dailyChartOptions} />
          </ChartCard>
          
          <ChartCard>
            <ChartTitle>ระยะทางการวิ่งรายสัปดาห์</ChartTitle>
            <Bar data={weeklyChartData} options={weeklyChartOptions} />
          </ChartCard>
          
          <RecordsTable>
            <ChartTitle>บันทึกการวิ่งล่าสุด</ChartTitle>
            
            {records.length > 0 ? (
              <Table>
                <thead>
                  <tr>
                    <th>วันที่</th>
                    <th>ระยะทาง (กม.)</th>
                    <th>เวลา (นาที)</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(record => (
                    <tr key={record.id}>
                      <td>{formatDate(record.run_date)}</td>
                      <td>{record.distance.toFixed(2)}</td>
                      <td>{record.duration ? (record.duration / 60).toFixed(0) : '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            ) : (
              <p style={{ textAlign: 'center' }}>ยังไม่มีบันทึกการวิ่ง</p>
            )}
          </RecordsTable>
          
          <ActionButton to="/submit">บันทึกการวิ่งใหม่</ActionButton>
          <ShareButton onClick={handleShare}>แชร์สถิติไปยัง LINE</ShareButton>
        </>
      )}
    </PageContainer>
  );
};

export default StatsPage;
