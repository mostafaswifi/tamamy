'use client'
import React , {useEffect,useState} from 'react'
import signedIn from '../../../public/loggedIn.jpg'
import Image from 'next/image'
import { useParams } from 'next/navigation'
import addSignature from '@/lib/addSignature'
import employeeLogIn from '@/lib/emloyeeLogIn'
const SignedInInfo = () => {
  const params = useParams()
  const [employe, setEmploye] = useState([])
  const [employeeData, setEmployeeData] = useState({
    employeeId: "",
    cordx: "",
    cordy: ""
  })
  
  useEffect(()=>{
    const data = async () => {
      const employee = await employeeLogIn()
     setEmploye(await employee.find(e => e.id.toString() === params.signedInInfo[1]))
      // console.log(employeeData)
      if (params.signedInInfo[1]) {
        setEmployeeData({ employeeId:params.signedInInfo[1], cordx: params.signedInInfo[3],cordy: params.signedInInfo[2]})
      }
      // console.log({...employeeData})
    }
    data()
    
    // console.log(params.signedInInfo[1], params.signedInInfo[2], params.signedInInfo[3])
    // console.log(employeeData)

    
  },[params.signedInInfo])

  useEffect(()=>{

    employeeData? addSignature({...employeeData}) : null

  },[employeeData])

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