'use client'
import React , {useEffect,useState} from 'react'
import signedIn from '../../../public/loggedIn.jpg'
import Image from 'next/image'
import { useParams } from 'next/navigation'

import employeeLogIn from '@/lib/emloyeeLogIn'
const SignedInInfo = () => {
  let [employe, setEmploye] = useState([])
  const params = useParams()
  
  useEffect(()=>{
    let data = async () => {
      const employee = await employeeLogIn()
      setEmploye(employee.find(e => e.id.toString() === params.signedInInfo[1]))
      console.log(employe)
    }
    data()
  },[employe, params.signedInInfo])


  return (
    <div className='container mt-5 d-flex justify-content-center align-items-center'>
        <Image src={signedIn} alt="signedIn" width={500} height={500} />
        <div className='d-flex flex-column justify-content-center align-items-center'>
            <h1>تم تسجيل الحضور بنجاح</h1>
           
            <h2>الأستاذ / {employe.employeeName}</h2>
            <h2></h2>
            <h2>الوظيفة / {employe.jobTitle} {employe.department}</h2>
        </div>
    </div>
  )
}

export default SignedInInfo