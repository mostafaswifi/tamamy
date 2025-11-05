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
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [user, setUser] = useState([]);
  const [logIn, setLogIn] = useState({
    username: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [locationAccuracy, setLocationAccuracy] = useState(null);
  const [highAccuracyCoords, setHighAccuracyCoords] = useState(null);

  // Hooks and utilities
  const router = useRouter();
  const { setLocation, setDateTime } = useLocationDateTimeStore();
  const { coords, isGeolocationAvailable, isGeolocationEnabled, getPosition } = useGeolocated({
    positionOptions: {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    },
    watchPosition: false,
    userDecisionTimeout: 10000,
  });

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

  // دالة للحصول على إحداثيات عالية الدقة
  const getHighAccuracyLocation = useCallback(async () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('الموقع الجغرافي غير مدعوم في هذا المتصفح'));
        return;
      }

      const options = {
        enableHighAccuracy: true,
        timeout: 20000, // 20 ثانية
        maximumAge: 0 // لا تستخدم بيانات قديمة
      };

      let bestAccuracy = Infinity;
      let bestCoords = null;
      let attempts = 0;
      const maxAttempts = 3;

      const watchId = navigator.geolocation.watchPosition(
        (position) => {
          attempts++;
          const { latitude, longitude, accuracy } = position.coords;
          
          console.log(`محاولة ${attempts}: الدقة ${accuracy} متر`);
          
          // حفظ أفضل إحداثيات
          if (accuracy < bestAccuracy) {
            bestAccuracy = accuracy;
            bestCoords = { latitude, longitude, accuracy };
            setLocationAccuracy(accuracy);
            setHighAccuracyCoords({ latitude, longitude });
          }

          // إذا وصلنا لدقة ممتازة (أقل من 10 متر) أو انتهت المحاولات
          if (accuracy <= 10 || attempts >= maxAttempts) {
            navigator.geolocation.clearWatch(watchId);
            
            if (bestCoords && bestCoords.accuracy <= 50) { // دقة مقبولة (50 متر أو أفضل)
              resolve(bestCoords);
            } else {
              reject(new Error(`دقة الموقع غير كافية: ${Math.round(bestAccuracy)} متر`));
            }
          }
        },
        (error) => {
          navigator.geolocation.clearWatch(watchId);
          let errorMessage = 'فشل في الحصول على الموقع';
          
          switch(error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = 'تم رفض الإذن للوصول إلى الموقع';
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = 'معلومات الموقع غير متاحة';
              break;
            case error.TIMEOUT:
              errorMessage = 'انتهت مهلة الحصول على الموقع';
              break;
          }
          
          reject(new Error(errorMessage));
        },
        options
      );

      // إيقاف تلقائي بعد 25 ثانية
      setTimeout(() => {
        navigator.geolocation.clearWatch(watchId);
        if (bestCoords && bestCoords.accuracy <= 50) {
          resolve(bestCoords);
        } else {
          reject(new Error('انتهت مهلة تحسين دقة الموقع'));
        }
      }, 25000);
    });
  }, []);

  // Handle login submission
  const handleLogin = useCallback(async (e) => {
    e.preventDefault();
    
    if (isSubmitting || isGettingLocation) return;
    
    setIsSubmitting(true);
    setIsGettingLocation(true);
    setError("");
    setLocationAccuracy(null);

    try {
      // Validate inputs
      if (!logIn.username.trim() || !logIn.password.trim()) {
        setError('خطأ في اسم المستخدم أو كلمة المرور');
        return;
      }

      if (!isGeolocationAvailable || !isGeolocationEnabled) {
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

      // الحصول على إحداثيات عالية الدقة
      setError('جاري تحديد موقعك بدقة...');
      const highAccuracyLocation = await getHighAccuracyLocation();
      
      console.log('الإحداثيات عالية الدقة:', highAccuracyLocation);

      // التحقق النهائي من الدقة
      if (highAccuracyLocation.accuracy > 50) {
        setError(`دقة الموقع غير كافية (${Math.round(highAccuracyLocation.accuracy)} متر). يرجى المحاولة في مكان مفتوح`);
        return;
      }

      // Update location and time
      setLocation(highAccuracyLocation.latitude, highAccuracyLocation.longitude);
      setDateTime(format(new Date(), 'dd/MM/yyyy HH:mm:ss'));
      
      // Navigate to signed in page
      router.replace(`/signedInInfo/${matchedUser.id}/${highAccuracyLocation.latitude}/${highAccuracyLocation.longitude}`);
      
    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || 'حدث خطأ أثناء محاولة تسجيل الدخول');
    } finally {
      setIsSubmitting(false);
      setIsGettingLocation(false);
    }
  }, [isSubmitting, isGettingLocation, logIn, user, isGeolocationAvailable, isGeolocationEnabled, router, setLocation, setDateTime, getHighAccuracyLocation]);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setLogIn(prev => ({ ...prev, [id]: value }));
    setError(""); // Clear error when user types
  };

  // حالة زر التسجيل
  const isLoginDisabled = isSubmitting || 
                         isGettingLocation || 
                         !isGeolocationAvailable || 
                         !isGeolocationEnabled ||
                         !logIn.username.trim() || 
                         !logIn.password.trim();

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
                    <div className={`alert ${error.includes('جاري') ? 'alert-info' : 'alert-danger'} d-flex align-items-center`} role="alert">
                      <i className={`bi ${error.includes('جاري') ? 'bi-info-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
                      <div>{error}</div>
                    </div>
                  )}

                  {/* Location Status */}
                  <div className="alert alert-info mb-4" role="alert">
                    <div className="d-flex align-items-center mb-2">
                      <i className="bi bi-geo-alt-fill me-2"></i>
                      <strong>حالة الموقع:</strong> 
                    </div>
                    <div className="small">
                      {isGeolocationAvailable && isGeolocationEnabled ? 
                        "✓ خدمة الموقع مفعلة" : 
                        "⚠️ يرجى تفعيل خدمة الموقع"
                      }
                      {locationAccuracy && (
                        <div className="mt-1">
                          📍 الدقة الحالية: <strong>{Math.round(locationAccuracy)} متر</strong>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Location Progress */}
                  {isGettingLocation && (
                    <div className="alert alert-warning mb-4">
                      <div className="d-flex align-items-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">جاري التحميل...</span>
                        </div>
                        <div>
                          <strong>جاري تحسين دقة الموقع...</strong>
                          <div className="small">يرجى الانتظار للحصول على أفضل دقة</div>
                        </div>
                      </div>
                      <div className="progress mt-2" style={{height: '6px'}}>
                        <div 
                          className="progress-bar progress-bar-striped progress-bar-animated" 
                          style={{width: '100%'}}
                        ></div>
                      </div>
                    </div>
                  )}

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
                      disabled={isSubmitting || isGettingLocation}
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
                      disabled={isSubmitting || isGettingLocation}
                      required
                    />
                  </div>

                  <button 
                    className="btn btn-primary btn-lg w-100 fw-bold py-3"
                    type="submit"
                    disabled={isLoginDisabled}
                  >
                    {isGettingLocation ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                        جاري تحديد الموقع...
                      </>
                    ) : isSubmitting ? (
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

                  {/* Tips */}
                  <div className="mt-3">
                    <small className="text-muted">
                      💡 للحصول على أفضل دقة: تأكد من تفعيل GPS وكونك في مكان مفتوح
                    </small>
                  </div>
                </form>
              </div>
            </div>
          </div>

          {/* باقي الكود بدون تغيير */}
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
                        <h6 className="fw-bold mb-1">تسجيل جغرافي دقيق</h6>
                        <p className="text-muted small mb-0">تحقق من الموقع بدقة تصل إلى 10 متر</p>
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
                        <h6 className="fw-bold mb-1">تحقق جغرافي آمن</h6>
                        <p className="text-muted small mb-0">ضمان دقة الموقع قبل التسجيل</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* باقي الكود بدون تغيير */}
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
                <div className="h4 fw-bold mb-1">دقة</div>
                <div className="small">تصل إلى 10 متر</div>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 bg-info text-white text-center">
              <div className="card-body py-3">
                <div className="h4 fw-bold mb-1">تحقق</div>
                <div className="small">جغرافي آمن</div>
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
