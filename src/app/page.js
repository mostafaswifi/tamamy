'use client'

import { useState, useEffect, useMemo, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { useLocationDateTimeStore } from '../store/store.js';
import { useGeolocated } from "react-geolocated";
import { format } from 'date-fns';
import MySwiper from "./components/swipper";
import employeeLogIn from "../lib/emloyeeLogIn";

// ... your image imports ...
import erp1 from '../../public/erp1.jpg';
import erp2 from '../../public/erp2.jpg';
import erp3 from '../../public/erp3.jpg';
import erp4 from '../../public/erp4.jpg';
import erp5 from '../../public/erp5.jpg';
import sign from '../../public/sign.jpg';


export default function AttendanceSystem() {
  // State management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [user, setUser] = useState([]);
  const [logIn, setLogIn] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");

  // Hooks and utilities
  const router = useRouter();
  const { setLocation, setDateTime } = useLocationDateTimeStore();
  const { coords, isGeolocationAvailable, isGeolocationEnabled } = useGeolocated();

  // Memoized values
  const images = useMemo(() => [erp1, erp2, erp3, erp4, erp5], []);

  // Fetch user data once on mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await employeeLogIn();
        setUser(userData);
      } catch (error) {
        // console.error("Failed to fetch user data:", error);
        setError("فشل في تحميل بيانات المستخدمين");
      }
    };

    fetchUserData();
  }, []);

  // Handle login submission
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError("");

    try {
      // Validate inputs
      if (!logIn.username.trim() || !logIn.password.trim()) {
        setError('خطأ في اسم المستخدم أو كلمة المرور');
        return;
      }

      if (!isGeolocationAvailable || !isGeolocationEnabled || !coords) {
        setError('يجب تفعيل خدمة الموقع الجغرافي');
        return;
      }

      // Find matching user
      const matchedUser = user.find(
        u => u.employeeName?.toLowerCase() === logIn.username.toLowerCase() && 
             u.employeeCode === logIn.password
      );

      if (!matchedUser) {
        setError('المستخدم غير موجود أو كلمة المرور غير صحيحة');
        return;
      }

      // Update location and time
      setLocation(coords.latitude, coords.longitude);
      setDateTime(format(new Date(), 'dd/MM/yyyy HH:mm:ss'));
      
      // Navigate to signed in page
      router.replace(`/signedInInfo/${matchedUser.id}/${coords.latitude}/${coords.longitude}`);
      
    } catch (error) {
      console.error("Login error:", error);
      setError('حدث خطأ أثناء محاولة تسجيل الدخول');
    } finally {
      setIsSubmitting(false);
    }
  }, [isSubmitting, logIn, user, coords, isGeolocationAvailable, isGeolocationEnabled, router, setLocation, setDateTime]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setLogIn(prev => ({ ...prev, [id]: value }));
    setError(""); // Clear error when user types
  };

  return (
    <>
      <MySwiper myImages={images} />

      <div className="row m-lg-5 m-md-4 justify-content-center align-items-center p-lg-5 p-md-2 p-sm-1" style={{ direction: "rtl" }}>
        <div className="col-lg-5 d-flex justify-content-center align-items-center">
          <Image src={sign} alt="sign" layout="responsive" width={400} height={400} />
        </div>
       
        <div className="col-lg-7 m-2 m-lg-0">
          <form onSubmit={handleLogin} className="m-2">
            <h1 className="h3 mb-3 fw-normal">تسجيل الحضور</h1>

            {error && (
              <div className="alert alert-danger" role="alert">
                {error}
              </div>
            )}

            <div className="form-floating mb-3">
              <input 
                type="text" 
                id="username"
                value={logIn.username} 
                onChange={handleInputChange} 
                className="form-control" 
                placeholder="أدخل اسم المستخدم "
                disabled={isSubmitting}
                required
              />
              <label htmlFor="username">أكتب اسم المستخدم</label>
            </div>
            
            <div className="form-floating mb-3">
              <input 
                type="password" 
                id="password"
                value={logIn.password} 
                onChange={handleInputChange} 
                className="form-control" 
                placeholder=" أدخل كلمة المرور "
                direction="rtl"
                disabled={isSubmitting}
                required
              />
              <label htmlFor="password">كلمة المرور</label>
            </div>

            <button 
              className="btn btn-primary w-100 py-2" 
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                  جاري المعالجة...
                </>
              ) : 'تسجيل الدخول'}
            </button>
            
            <p className="mt-5 mb-3 text-body-secondary">© 2017–2025</p>
          </form>
        </div>
      </div>

      {/* ... rest of your informational content ... */}
    </>
  );
}