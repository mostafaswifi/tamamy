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
    <div className="bg-light min-vh-100" dir="rtl">
      {/* Header */}
      <nav className="navbar navbar-light bg-white shadow-sm border-bottom">
        <div className="container">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-2 d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '45px', height: '45px' }}>
              <span className="text-white fw-bold fs-5">ح</span>
            </div>
            <div>
              <h1 className="navbar-brand h5 mb-0 fw-bold text-dark">نظام تسجيل الحضور</h1>
              <p className="text-muted small mb-0">نظام تتبع الحضور الجغرافي للموظفين</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Hero Section with Carousel */}
        <div className="card shadow-lg border-0 mb-4 overflow-hidden">
          <div className="card-body p-0">
            <MySwiper myImages={images} />
          </div>
        </div>

        {/* Login Section */}
        <div className="row g-4 justify-content-center align-items-center">
          {/* Login Form */}
          <div className="col-lg-6">
            <div className="card shadow-lg border-0">
              <div className="card-header bg-primary text-white border-0 py-4">
                <h2 className="card-title h4 mb-0 fw-bold text-center">
                  تسجيل الحضور
                </h2>
              </div>
              <div className="card-body p-4">
                <form onSubmit={handleLogin}>
                  {error && (
                    <div className="alert alert-danger d-flex align-items-center" role="alert">
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      <div>{error}</div>
                    </div>
                  )}

                  {/* Location Status */}
                  <div className="alert alert-info d-flex align-items-center mb-4" role="alert">
                    <i className="bi bi-geo-alt-fill me-2"></i>
                    <div>
                      <strong>حالة الموقع:</strong> 
                      {isGeolocationAvailable && isGeolocationEnabled ? 
                        " ✓ جاهز لتسجيل الموقع" : 
                        " ⚠️ يرجى تفعيل خدمة الموقع"
                      }
                    </div>
                  </div>

                  <div className="mb-3">
                    <label htmlFor="username" className="form-label fw-semibold text-dark">
                      اسم المستخدم
                    </label>
                    <input 
                      type="text" 
                      id="username"
                      value={logIn.username} 
                      onChange={handleInputChange} 
                      className="form-control form-control-lg" 
                      placeholder="أدخل اسم المستخدم"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="password" className="form-label fw-semibold text-dark">
                      كلمة المرور
                    </label>
                    <input 
                      type="password" 
                      id="password"
                      value={logIn.password} 
                      onChange={handleInputChange} 
                      className="form-control form-control-lg" 
                      placeholder="أدخل كلمة المرور"
                      disabled={isSubmitting}
                      required
                    />
                  </div>

                  <button 
                    className="btn btn-primary btn-lg w-100 fw-bold py-3"
                    type="submit"
                    disabled={isSubmitting || !isGeolocationAvailable || !isGeolocationEnabled}
                  >
                    {isSubmitting ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        جاري تسجيل الحضور...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle-fill me-2"></i>
                        تسجيل الحضور
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>

          {/* Info Section */}
          <div className="col-lg-6">
            <div className="card shadow-lg border-0 h-100">
              <div className="card-header bg-white border-0 py-4">
                <h3 className="card-title h5 mb-0 fw-bold text-primary text-center">
                  معلومات النظام
                </h3>
              </div>
              <div className="card-body">
                <div className="text-center mb-4">
                  <Image 
                    src={sign} 
                    alt="Attendance System" 
                    className="img-fluid rounded-3"
                    width={300}
                    height={300}
                    style={{maxHeight: '200px', objectFit: 'cover'}}
                  />
                </div>
                
                <div className="row g-3">
                  <div className="col-12">
                    <div className="d-flex align-items-center p-3 bg-light rounded-3">
                      <i className="bi bi-geo-fill text-primary fs-4 me-3"></i>
                      <div>
                        <h6 className="fw-bold mb-1">تسجيل جغرافي</h6>
                        <p className="text-muted small mb-0">تسجيل الموقع الجغرافي الفعلي للحضور</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <div className="d-flex align-items-center p-3 bg-light rounded-3">
                      <i className="bi bi-clock-fill text-success fs-4 me-3"></i>
                      <div>
                        <h6 className="fw-bold mb-1">توقيت دقيق</h6>
                        <p className="text-muted small mb-0">تسجيل الوقت الفعلي للحضور</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="col-12">
                    <div className="d-flex align-items-center p-3 bg-light rounded-3">
                      <i className="bi bi-shield-check-fill text-warning fs-4 me-3"></i>
                      <div>
                        <h6 className="fw-bold mb-1">آمن ومؤمن</h6>
                        <p className="text-muted small mb-0">نظام آمن لحماية بيانات الحضور</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="row mt-5">
          <div className="col-md-3">
            <div className="card border-0 bg-primary text-white text-center">
              <div className="card-body py-3">
                <div className="h4 fw-bold mb-1">{user.length}</div>
                <div className="small">موظف مسجل</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-success text-white text-center">
              <div className="card-body py-3">
                <div className="h4 fw-bold mb-1">نظام</div>
                <div className="small">تسجيل جغرافي</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-info text-white text-center">
              <div className="card-body py-3">
                <div className="h4 fw-bold mb-1">24/7</div>
                <div className="small">متاح دائمًا</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-warning text-white text-center">
              <div className="card-body py-3">
                <div className="h4 fw-bold mb-1">آمن</div>
                <div className="small">وحماية بيانات</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-5 pt-4 border-top">
          <p className="text-muted mb-0">© 2024 نظام تسجيل الحضور الجغرافي. جميع الحقوق محفوظة.</p>
        </div>
      </div>
    </div>
  );
}
