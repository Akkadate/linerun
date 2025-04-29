// src/pages/RegisterPage.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/Loading';

const RegisterContainer = styled.div`
  max-width: 500px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const RegisterCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
`;

const PageTitle = styled.h2`
  font-size: 1.5rem;
  color: var(--primary-color);
  margin-bottom: 1.5rem;
  text-align: center;
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
`;

const Input = styled(Field)`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
`;

const DateInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
`;

const ErrorText = styled.div`
  color: var(--error-color);
  font-size: 0.875rem;
  margin-top: 0.25rem;
`;

const SubmitButton = styled.button`
  width: 100%;
  background-color: var(--primary-color);
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
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ProfilePreview = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  padding: 1rem;
  background-color: #f8f8f8;
  border-radius: 8px;
`;

const ProfileImage = styled.img`
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
`;

const ProfileName = styled.p`
  font-weight: 600;
  font-size: 1.1rem;
`;

// Validation schema
const RegisterSchema = Yup.object().shape({
  phoneNumber: Yup.string()
    .matches(/^[0-9]{10}$/, 'กรุณากรอกเบอร์โทรศัพท์ให้ถูกต้อง (10 หลัก)')
    .required('กรุณากรอกเบอร์โทรศัพท์'),
  birthDate: Yup.date()
    .required('กรุณาระบุวันเกิด')
    .max(new Date(), 'วันเกิดต้องเป็นวันที่ในอดีต')
});

const RegisterPage = () => {
  const { currentUser, updateProfile, isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [birthDate, setBirthDate] = useState('');
  
  useEffect(() => {
    // If user has completed registration, redirect to stats page
    if (isAuthenticated && currentUser && currentUser.phone_number) {
      navigate('/stats');
    }
    // If not authenticated at all, redirect to home
    else if (!isAuthenticated && !loading) {
      navigate('/');
    }
  }, [isAuthenticated, currentUser, loading, navigate]);
  
  if (loading || !currentUser) {
    return <Loading message="กำลังโหลดข้อมูล..." />;
  }
  
  const handleRegisterSubmit = async (values, { setSubmitting, setStatus }) => {
    try {
      await updateProfile({
        phoneNumber: values.phoneNumber,
        birthDate: values.birthDate
      });
      
      navigate('/stats');
    } catch (error) {
      console.error('Registration error:', error);
      setStatus({ error: error.message || 'การลงทะเบียนล้มเหลว กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setSubmitting(false);
    }
  };
  
  const handleDateChange = (e, setFieldValue) => {
    const value = e.target.value;
    setBirthDate(value);
    setFieldValue('birthDate', value);
  };
  
  return (
    <RegisterContainer>
      <RegisterCard>
        <PageTitle>กรอกข้อมูลเพิ่มเติม</PageTitle>
        
        {currentUser && (
          <ProfilePreview>
            {currentUser.profile_picture && (
              <ProfileImage 
                src={currentUser.profile_picture} 
                alt={currentUser.display_name} 
              />
            )}
            <ProfileName>{currentUser.display_name}</ProfileName>
          </ProfilePreview>
        )}
        
        <Formik
          initialValues={{
            phoneNumber: '',
            birthDate: ''
          }}
          validationSchema={RegisterSchema}
          onSubmit={handleRegisterSubmit}
        >
          {({ isSubmitting, setFieldValue, status }) => (
            <Form>
              <FormGroup>
                <Label htmlFor="phoneNumber">เบอร์โทรศัพท์</Label>
                <Input 
                  type="tel" 
                  id="phoneNumber" 
                  name="phoneNumber" 
                  placeholder="เบอร์โทรศัพท์ 10 หลัก" 
                />
                <ErrorMessage name="phoneNumber" component={ErrorText} />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="birthDate">วันเกิด</Label>
                <DateInput 
                  type="date" 
                  id="birthDate" 
                  name="birthDate"
                  value={birthDate}
                  onChange={(e) => handleDateChange(e, setFieldValue)}
                  max={new Date().toISOString().split('T')[0]}
                />
                <ErrorMessage name="birthDate" component={ErrorText} />
              </FormGroup>
              
              {status && status.error && (
                <ErrorText>{status.error}</ErrorText>
              )}
              
              <SubmitButton type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'กำลังบันทึก...' : 'บันทึกข้อมูล'}
              </SubmitButton>
            </Form>
          )}
        </Formik>
      </RegisterCard>
    </RegisterContainer>
  );
};

export default RegisterPage;
