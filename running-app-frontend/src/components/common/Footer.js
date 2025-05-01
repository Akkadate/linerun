// src/components/common/Footer.js
import React from 'react';
import styled from 'styled-components';

const FooterContainer = styled.footer`
  background-color: var(--text-color);
  color: white;
  padding: 1rem;
  text-align: center;
  font-size: 0.875rem;
`;

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <FooterContainer>
      <p>&copy; {currentYear} LINE Running App. All rights reserved.</p>
    </FooterContainer>
  );
};

export default Footer;
