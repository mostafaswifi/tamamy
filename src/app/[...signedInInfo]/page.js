'use client'
import React, { useEffect, useState, useCallback, useMemo } from 'react'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import { useGeolocated } from "react-geolocated";
import addSignature from '@/lib/addSignature'
import employeeLogIn from '@/lib/emloyeeLogIn'
import signedIn from '../../../public/loggedIn.jpg'

const SignedInInfo = () => {
  const params = useParams()
  const [employee, setEmployee] = useState(null)
  const [submissionStatus, setSubmissionStatus] = useState('idle') // 'idle', 'submitting', 'success', 'error'
  const { coords } = useGeolocated()
console.log(coords)
  // Memoized employee data
  const employeeData = useMemo(() => ({
    employeeId: params.signedInInfo?.[1] || '',
    cordx: params.signedInInfo?.[3] || coords?.latitude|| '',
    cordy: params.signedInInfo?.[2] || coords?.longitude  || ''
  }), [params.signedInInfo, coords])

  // Fetch employee data
  const fetchEmployeeData = useCallback(async () => {
    try {
      const employees = await employeeLogIn()
      const foundEmployee = employees.find(e => e.id.toString() === employeeData.employeeId)
      setEmployee(foundEmployee || null)
    } catch (error) {
      console.error("Error fetching employee data:", error)
      setSubmissionStatus('error')
    }
  }, [employeeData.employeeId])

  // Handle attendance submission
  const submitAttendance = useCallback(async () => {
    if (!employeeData.employeeId || !employeeData.cordx || !employeeData.cordy) {
      console.error("Missing required data for submission")
      return
    }

    if (submissionStatus === 'submitting' || submissionStatus === 'success') {
      return
    }

    setSubmissionStatus('submitting')
    
    try {
      await addSignature(employeeData)
      setSubmissionStatus('success')
    } catch (error) {
      console.error("Error submitting attendance:", error)
      setSubmissionStatus('error')
    }
  }, [employeeData, submissionStatus])

  // Initial data loading
  useEffect(() => {
    fetchEmployeeData()
  }, [fetchEmployeeData])

  // Submit attendance when data is ready
  useEffect(() => {
    if (employee && employeeData.employeeId && employeeData.cordx && employeeData.cordy) {
      submitAttendance()
    }
  }, [employee, employeeData, submitAttendance])

  if (submissionStatus === 'error') {
    return (
      <div className='container mt-5 d-flex justify-content-center align-items-center'>
        <div className='alert alert-danger'>
          حدث خطأ أثناء تسجيل الحضور. يرجى المحاولة مرة أخرى.
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className='container mt-5 d-flex justify-content-center align-items-center'>
        <div className='spinner-border text-primary' role='status'>
          <span className='visually-hidden'>جاري التحميل...</span>
        </div>
      </div>
    )
  }

  return (
    <div className='container mt-5 d-flex flex-column flex-md-row justify-content-center align-items-center gap-4'>
      <Image 
        src={signedIn} 
        alt="signedIn" 
        width={500} 
        height={500}
        priority
        className='img-fluid'
      />
      <div className='text-center text-md-start'>
        <h1 className='text-success mb-4'>تم تسجيل الحضور بنجاح</h1>
        <h2 className='mb-3'>الأستاذ / {employee.employeeName}</h2>
        <h2 className='mb-3'>الوظيفة / {employee.jobTitle}</h2>
        {employee.department && <h2 className='mb-3'>القسم / {employee.department}</h2>}
        <div className='mt-4 text-muted'>
          <small>تم التسجيل في: {new Date().toLocaleString('ar-EG')}</small>
        </div>
        {submissionStatus === 'submitting' && (
          <div className="mt-3 text-primary">
            جاري حفظ البيانات...
          </div>
        )}
      </div>
    </div>
  )
}

export default SignedInInfo
