// src/components/common/Header.js
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: var(--primary-color);
  color: white;
  padding: 1rem;
`;

const HeaderContent = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  max-width: 800px;
  margin: 0 auto;
`;

const Logo = styled.h1`
  font-size: 1.5rem;
  margin: 0;

  a {
    color: white;
    text-decoration: none;
  }
`;

const Nav = styled.nav`
  display: flex;
  gap: 1rem;
`;

const NavLink = styled(Link)`
  color: white;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const ProfileContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProfileImage = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
`;

const LogoutButton = styled.button`
  background: none;
  border: none;
  color: white;
  font-weight: 500;
  cursor: pointer;
  padding: 0.5rem;
  
  &:hover {
    text-decoration: underline;
  }
`;

const Header = () => {
  const { currentUser, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <HeaderContainer>
      <HeaderContent>
        <Logo>
          <Link to="/">LINE Running</Link>
        </Logo>
        
        <Nav>
          {isAuthenticated ? (
            <>
              <NavLink to="/submit">บันทึกการวิ่ง</NavLink>
              <NavLink to="/stats">สถิติส่วนตัว</NavLink>
              <NavLink to="/leaderboard">อันดับ</NavLink>
              
              <ProfileContainer>
                {currentUser?.profile_picture && (
                  <ProfileImage 
                    src={currentUser.profile_picture} 
                    alt={currentUser.display_name} 
                  />
                )}
                <LogoutButton onClick={handleLogout}>ออกจากระบบ</LogoutButton>
              </ProfileContainer>
            </>
          ) : (
            <NavLink to="/">เข้าสู่ระบบ</NavLink>
          )}
        </Nav>
      </HeaderContent>
    </HeaderContainer>
  );
};

export default Header;
