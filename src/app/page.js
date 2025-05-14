'use client'


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLocationDateTimeStore } from '../store/store.js';
import {useGeolocated} from "react-geolocated";
import {format} from 'date-fns';
import MySwiper from "./components/swipper";
import employeeLogIn from "../lib/emloyeeLogIn";


import sign from '../../public/sign.jpg'
import erp1 from '../../public/erp1.jpg'
import erp2 from '../../public/erp2.jpg'
import erp3 from '../../public/erp3.jpg'
import erp4 from '../../public/erp4.jpg'
import erp5 from '../../public/erp5.jpg'



export default function Home() {

  const now = new Date();
let dateTimeSignature = format(now, 'dd/MM/yyyy HH:mm:ss');
  const {location, setLocation, dateTime, setDateTime} = useLocationDateTimeStore();

    const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated();
  
    const [isClient, setIsClient] = useState(false)




const images = [erp1, erp2, erp3, erp4, erp5]

  let router = useRouter()

 const [user, setUser] = useState([])
 const [loggedUser, setLoggedUser] = useState([])
 const [logIn, setLogIn] = useState({
  username: "",
  password: "",
});

  useEffect(() => {
 
    let data = async () => {
     
    let userData = await employeeLogIn()
     setUser(userData)
     setLoggedUser( user.filter((user)=>user.employeeName?.toLowerCase().toString() === logIn.username.toLowerCase().toString() && user.employeeCode === logIn.password.toLowerCase().toString()))
    }
    data()



    setIsClient(true)
    setLocation(coords?.latitude, coords?.longitude)
    setDateTime(dateTimeSignature)
  }, [logIn.password, logIn.username, user,coords, dateTime,dateTimeSignature,setDateTime,setLocation,loggedUser]);

  
  let logInFunction = (e) => {
    e.preventDefault()
    !logIn.username || !logIn.password ? alert('خطأ في اسم المستخدم أو كلمة المرور') : loggedUser[0]? router.replace(`/signedInInfo/${loggedUser[0].id}/${coords?.latitude}/${coords?.longitude}`) :  router.replace(`/`)

    setLogIn({
        username: "",
        password: "",
    })
    
  
 }

  return (
    <>
    <MySwiper myImages={images}/>

    <div className="row m-lg-5 m-md-4  justify-content-center align-items-center p-lg-5 p-md-2 p-sm-1" style={{ direction: "rtl" }}>
    <div className="col-lg-5 d-flex justify-content-center align-items-center">
    {/* flex image size */}
    <Image src={sign} alt="sign" layout="responsive" width={400} height={400} />
    </div>
   
    <div className="col-lg-7 m-2 m-lg-0 ">
      <form className="m-2">
        <h1 className="h3 mb-3 fw-normal">تسجيل الحضور</h1>

        <div className="form-floating mb-3" >
          <input type="text" value={logIn.username} onChange={(e) => setLogIn({ ...logIn, username: e.target.value })} className="form-control" id="floatingInput" placeholder=" اسم المستخدم" />
          <label htmlFor="floatingInput">أكتب اسم المستخدم</label>
        </div>
        <div className="form-floating mb-3">
          <input type="password" value={logIn.password} onChange={(e) => setLogIn({ ...logIn, password: e.target.value })} className="form-control" id="floatingPassword" placeholder="كلمة المرور" />
          <label htmlFor="floatingPassword">كلمة المرور</label>
        </div>


        <button className="btn btn-primary w-100 py-2" type="submit" onClick={(e)=>logInFunction(e)}>تسجيل الدخول</button>
        <p className="mt-5 mb-3 text-body-secondary">© 2017–2025</p>
      </form>
     
    </div>
     </div>
     {coords && coords.latitude }
      {coords && coords.longitude }
    </>
  );
}
