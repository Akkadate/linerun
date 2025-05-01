// src/pages/RunningFormPage.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import styled from 'styled-components';
import { runningAPI, uploadAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import Loading from '../components/common/Loading';
import { createClient } from '@supabase/supabase-js';
import config from '../config';

// Initialize Supabase client
const supabase = createClient(config.supabaseUrl, config.supabaseAnonKey);

const PageContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const FormCard = styled.div`
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
  margin-bottom: 1.5rem;
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

const FileInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
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

const SuccessMessage = styled.div`
  background-color: var(--success-color);
  color: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 1rem;
  text-align: center;
`;

const ImagePreview = styled.div`
  margin-top: 1rem;
  text-align: center;
  
  img {
    max-width: 100%;
    max-height: 300px;
    border-radius: 8px;
    border: 1px solid var(--border-color);
  }
`;

const HelpText = styled.p`
  font-size: 0.875rem;
  color: #666;
  margin-top: 0.25rem;
`;

// Validation schema
const RunningFormSchema = Yup.object().shape({
  runDate: Yup.date()
    .required('กรุณาระบุวันที่วิ่ง')
    .max(new Date(), 'วันที่วิ่งต้องไม่เป็นวันในอนาคต'),
  distance: Yup.number()
    .required('กรุณาระบุระยะทาง')
    .positive('ระยะทางต้องเป็นค่าบวก')
    .max(200, 'ระยะทางต้องไม่เกิน 200 กิโลเมตร'),
  duration: Yup.number()
    .nullable()
    .transform((value) => (isNaN(value) ? undefined : value))
    .min(0, 'เวลาต้องไม่เป็นค่าลบ')
});

const RunningFormPage = () => {
  const { currentUser, loading } = useAuth();
  const navigate = useNavigate();
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [runDate, setRunDate] = useState(new Date().toISOString().split('T')[0]);
  
  if (loading) {
    return <Loading message="กำลังโหลด..." />;
  }
  
  const handleFileChange = (event, setFieldValue) => {
    const file = event.target.files[0];
    if (!file) return;
    
    // Check file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg'];
    if (!allowedTypes.includes(file.type)) {
      alert('กรุณาอัปโหลดไฟล์รูปภาพเท่านั้น (JPEG, PNG)');
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      alert('ขนาดไฟล์ต้องไม่เกิน 5MB');
      return;
    }
    
    setSelectedFile(file);
    setFieldValue('evidenceImage', file);
    
    // Create preview URL
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result);
    };
    reader.readAsDataURL(file);
  };
  
  const handleDateChange = (e, setFieldValue) => {
    const value = e.target.value;
    setRunDate(value);
    setFieldValue('runDate', value);
  };
  
  const uploadImageToSupabase = async (file) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${currentUser.id}/${fileName}`;
      
      const { data, error } = await supabase.storage
        .from('running_evidence')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });
        
      if (error) throw error;
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('running_evidence')
        .getPublicUrl(filePath);
        
      return urlData.publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw new Error('การอัปโหลดรูปภาพล้มเหลว กรุณาลองใหม่อีกครั้ง');
    }
  };
  
  const handleSubmit = async (values, { setSubmitting, setStatus, resetForm }) => {
    try {
      let evidenceImageUrl = null;
      
      // Upload image if selected
      if (selectedFile) {
        evidenceImageUrl = await uploadImageToSupabase(selectedFile);
      }
      
      // Create running record
      await runningAPI.addRunningRecord({
        runDate: values.runDate,
        distance: parseFloat(values.distance),
        duration: values.duration ? parseInt(values.duration) : null,
        evidenceImageUrl
      });
      
      // Reset form and state
      resetForm();
      setSelectedFile(null);
      setPreviewUrl(null);
      setSubmitSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        navigate('/stats');
      }, 2000);
    } catch (error) {
      console.error('Submit error:', error);
      setStatus({ error: error.message || 'การบันทึกข้อมูลล้มเหลว กรุณาลองใหม่อีกครั้ง' });
    } finally {
      setSubmitting(false);
    }
  };
  
  return (
    <PageContainer>
      <FormCard>
        <PageTitle>บันทึกการวิ่ง</PageTitle>
        
        {submitSuccess && (
          <SuccessMessage>
            บันทึกข้อมูลสำเร็จ! กำลังนำคุณไปหน้าสถิติ...
          </SuccessMessage>
        )}
        
        <Formik
          initialValues={{
            runDate: runDate,
            distance: '',
            duration: '',
            evidenceImage: null
          }}
          validationSchema={RunningFormSchema}
          onSubmit={handleSubmit}
        >
          {({ isSubmitting, setFieldValue, status }) => (
            <Form>
              <FormGroup>
                <Label htmlFor="runDate">วันที่วิ่ง</Label>
                <DateInput 
                  type="date" 
                  id="runDate" 
                  name="runDate"
                  value={runDate}
                  onChange={(e) => handleDateChange(e, setFieldValue)}
                  max={new Date().toISOString().split('T')[0]}
                />
                <ErrorMessage name="runDate" component={ErrorText} />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="distance">ระยะทาง (กิโลเมตร)</Label>
                <Input 
                  type="number" 
                  id="distance" 
                  name="distance" 
                  step="0.01" 
                  min="0" 
                  placeholder="ระบุระยะทาง เช่น 5.5" 
                />
                <ErrorMessage name="distance" component={ErrorText} />
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="duration">เวลาที่ใช้ (นาที)</Label>
                <Input 
                  type="number" 
                  id="duration" 
                  name="duration" 
                  min="0" 
                  placeholder="ระบุเวลาที่ใช้ (ไม่บังคับ)" 
                />
                <ErrorMessage name="duration" component={ErrorText} />
                <HelpText>ไม่จำเป็นต้องกรอกหากไม่ต้องการบันทึกเวลา</HelpText>
              </FormGroup>
              
              <FormGroup>
                <Label htmlFor="evidenceImage">ภาพหลักฐานการวิ่ง</Label>
                <FileInput 
                  type="file" 
                  id="evidenceImage" 
                  name="evidenceImage"
                  onChange={(e) => handleFileChange(e, setFieldValue)}
                  accept="image/jpeg, image/png, image/jpg"
                />
                <HelpText>อัปโหลดภาพหลักฐานจากแอพนับระยะทาง เช่น Nike Run Club, Strava</HelpText>
                
                {previewUrl && (
                  <ImagePreview>
                    <img src={previewUrl} alt="ภาพหลักฐานการวิ่ง" />
                  </ImagePreview>
                )}
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
      </FormCard>
    </PageContainer>
  );
};

export default RunningFormPage;
