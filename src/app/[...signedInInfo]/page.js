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
  const [hasSubmitted, setHasSubmitted] = useState(false) // لمنع الإرسال المتكرر
  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
    },
    watchPosition: true,
    userDecisionTimeout: 10000,
  })

  console.log('الإحداثيات:', coords)
  console.log('معلمات الرابط:', params.signedInInfo)

  // Memoized employee data
  const employeeData = useMemo(() => ({
    employeeId: params.signedInInfo?.[1] || '',
    cordx: coords?.latitude?.toString() || params.signedInInfo?.[3] || '',
    cordy: coords?.longitude?.toString() || params.signedInInfo?.[2] || ''
  }), [params.signedInInfo, coords])

  // Fetch employee data
  const fetchEmployeeData = useCallback(async () => {
    try {
      console.log('جاري جلب بيانات الموظف...', employeeData.employeeId)
      const employees = await employeeLogIn()
      const foundEmployee = employees.find(e => e.id.toString() === employeeData.employeeId)
      
      if (foundEmployee) {
        console.log('تم العثور على الموظف:', foundEmployee)
        setEmployee(foundEmployee)
      } else {
        console.error('لم يتم العثور على الموظف بالرقم:', employeeData.employeeId)
        setSubmissionStatus('error')
      }
    } catch (error) {
      console.error("Error fetching employee data:", error)
      setSubmissionStatus('error')
    }
  }, [employeeData.employeeId])

  // Handle attendance submission
  const submitAttendance = useCallback(async () => {
    if (hasSubmitted) {
      console.log('تم الإرسال مسبقاً، تخطي...')
      return
    }

    if (!employeeData.employeeId) {
      console.error("معرف الموظف مفقود")
      setSubmissionStatus('error')
      return
    }

    if (!employeeData.cordx || !employeeData.cordy) {
      console.error("الإحداثيات غير متوفرة:", employeeData)
      setSubmissionStatus('error')
      return
    }

    if (submissionStatus === 'submitting' || submissionStatus === 'success') {
      return
    }

    console.log('جاري إرسال بيانات الحضور...', employeeData)
    setSubmissionStatus('submitting')
    setHasSubmitted(true)
    
    try {
      await addSignature(employeeData)
      console.log('تم إرسال البيانات بنجاح')
      setSubmissionStatus('success')
    } catch (error) {
      console.error("Error submitting attendance:", error)
      setSubmissionStatus('error')
      setHasSubmitted(false) // السماح بإعادة المحاولة
    }
  }, [employeeData, submissionStatus, hasSubmitted])

  // Initial data loading
  useEffect(() => {
    if (employeeData.employeeId) {
      fetchEmployeeData()
    } else {
      console.error('معرف الموظف غير متوفر في معلمات الرابط')
      setSubmissionStatus('error')
    }
  }, [fetchEmployeeData, employeeData.employeeId])

  // Submit attendance when data is ready
  useEffect(() => {
    if (employee && 
        employeeData.employeeId && 
        employeeData.cordx && 
        employeeData.cordy && 
        !hasSubmitted &&
        submissionStatus === 'idle') {
      console.log('جميع البيانات جاهزة، بدء الإرسال...')
      submitAttendance()
    }
  }, [employee, employeeData, submitAttendance, hasSubmitted, submissionStatus])

  // التحقق من حالة GPS
  useEffect(() => {
    if (!isGeolocationAvailable) {
      console.warn('الموقع الجغرافي غير متاح في هذا المتصفح')
    }
    
    if (!isGeolocationEnabled) {
      console.warn('الموقع الجغرافي غير مفعل')
    }
  }, [isGeolocationAvailable, isGeolocationEnabled])

  if (submissionStatus === 'error') {
    return (
      <div className='container mt-5 d-flex justify-content-center align-items-center min-vh-50'>
        <div className='alert alert-danger text-center'>
          <h4>حدث خطأ أثناء تسجيل الحضور</h4>
          <p className='mb-0'>يرجى المحاولة مرة أخرى أو التواصل مع الدعم الفني</p>
          <small className='text-muted'>
            {!coords && ' - الإحداثيات غير متاحة'}
            {!employeeData.employeeId && ' - بيانات الموظف غير متاحة'}
          </small>
        </div>
      </div>
    )
  }

  if (!employee) {
    return (
      <div className='container mt-5 d-flex justify-content-center align-items-center min-vh-50'>
        <div className='text-center'>
          <div className='spinner-border text-primary mb-3' role='status'>
            <span className='visually-hidden'>جاري التحميل...</span>
          </div>
          <p>جاري تحميل بيانات الموظف...</p>
          {!coords && (
            <div className='alert alert-warning mt-3'>
              <small>جاري الحصول على الموقع الجغرافي...</small>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className='container mt-5 d-flex flex-column flex-md-row justify-content-center align-items-center gap-4 min-vh-50'>
      <Image 
        src={signedIn} 
        alt="signedIn" 
        width={500} 
        height={500}
        priority
        className='img-fluid rounded shadow'
      />
      <div className='text-center text-md-start'>
        <h1 className='text-success mb-4'>تم تسجيل الحضور بنجاح</h1>
        <h2 className='mb-3'>
          <span className='text-primary'>الأستاذ / </span>
          {employee.employeeName}
        </h2>
        <h2 className='mb-3'>
          <span className='text-primary'>الوظيفة / </span>
          {employee.jobTitle}
        </h2>
        {employee.department && (
          <h2 className='mb-3'>
            <span className='text-primary'>القسم / </span>
            {employee.department}
          </h2>
        )}
        
        {/* عرض معلومات الموقع */}
        {coords && (
          <div className='alert alert-info mt-3'>
            <small>
              <strong>الموقع المسجل:</strong><br/>
              خط العرض: {coords.latitude.toFixed(6)}<br/>
              خط الطول: {coords.longitude.toFixed(6)}<br/>
              الدقة: ±{coords.accuracy?.toFixed(1)} متر
            </small>
          </div>
        )}

        <div className='mt-4 text-muted'>
          <small>تم التسجيل في: {new Date().toLocaleString('ar-EG')}</small>
        </div>
        
        {submissionStatus === 'submitting' && (
          <div className="mt-3 text-primary">
            <div className="spinner-border spinner-border-sm me-2" role="status">
              <span className="visually-hidden">جاري الحفظ...</span>
            </div>
            جاري حفظ البيانات في النظام...
          </div>
        )}

        {submissionStatus === 'success' && (
          <div className="mt-3 text-success">
            <i className="bi bi-check-circle-fill me-2"></i>
            تم حفظ البيانات بنجاح في النظام
          </div>
        )}
      </div>
    </div>
  )
}

export default SignedInInfo
