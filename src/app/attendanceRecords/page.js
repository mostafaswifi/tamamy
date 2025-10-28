"use client";
import { useEffect, useState, useCallback } from "react";
import * as turf from "@turf/turf";
import getPlaces from "@/lib/getPlaces";
import employeeLogIn from "../../lib/emloyeeLogIn";

// Statistics Component with Bootstrap
const StatisticsCard = ({ coordinates, schools, employee }) => (
  <div className="card shadow-lg border-0 mb-4">
    <div className="card-header bg-white border-bottom-0 pb-0">
      <h3 className="card-title h4 mb-0 text-primary fw-bold">إحصائيات التحقق</h3>
    </div>
    <div className="card-body">
      <div className="row g-4">
        <div className="col-md-4">
          <div className="text-center p-4 bg-light rounded-3 border border-light">
            <div className="h2 fw-bold text-primary mb-2">{coordinates.length}</div>
            <div className="h6 text-dark fw-semibold">إجمالي الإحداثيات</div>
            <div className="text-muted small mt-2">نقطة توقيع</div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="text-center p-4 bg-light rounded-3 border border-light">
            <div className="h2 fw-bold text-success mb-2">{schools.length}</div>
            <div className="h6 text-dark fw-semibold">المدارس المطابقة</div>
            <div className="text-muted small mt-2">مدرسة متطابقة</div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="text-center p-4 bg-light rounded-3 border border-light">
            <div className="h2 fw-bold text-info mb-2">{employee ? 1 : 0}</div>
            <div className="h6 text-dark fw-semibold">موظف محدد</div>
            <div className="text-muted small mt-2">حالة النشاط</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// Coordinate List with Bootstrap
const CoordinateList = ({ coordinates }) => (
  <div className="card shadow-lg border-0 h-100">
    <div className="card-header bg-primary text-white border-0">
      <h4 className="card-title h5 mb-0 fw-bold">إحداثيات الموظف</h4>
    </div>
    <div className="card-body p-0">
      <div className="p-3" style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {coordinates.length > 0 ? (
          <div className="list-group list-group-flush">
            {coordinates.map(([lat, lng], idx) => (
              <div 
                key={idx} 
                className="list-group-item d-flex justify-content-between align-items-center border-0 py-3"
              >
                <div className="d-flex align-items-center">
                  <span className="badge bg-primary rounded-circle me-3">•</span>
                  <code className="text-dark fs-6">
                    {lat?.toFixed(6)}, {lng?.toFixed(6)}
                  </code>
                </div>
                <span className="badge bg-light text-primary border border-primary fs-6">
                  #{idx + 1}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-5">
            <div className="text-muted mb-2">
              <i className="bi bi-geo-alt fs-1"></i>
            </div>
            <h5 className="text-dark">لا توجد إحداثيات متاحة</h5>
            <p className="text-muted">سيتم عرض الإحداثيات هنا بعد اختيار الموظف</p>
          </div>
        )}
      </div>
    </div>
  </div>
);

// School List with Bootstrap
const SchoolList = ({ schools }) => (
  <div className="card shadow-lg border-0 h-100">
    <div className="card-header bg-success text-white border-0">
      <h4 className="card-title h5 mb-0 fw-bold">المدارس المطابقة</h4>
    </div>
    <div className="card-body">
      {schools.length > 0 ? (
        <div className="row g-3">
          {schools.map((school, idx) => (
            <div key={school.id || idx} className="col-12">
              <div className="card border-0 bg-light hover-shadow">
                <div className="card-body">
                  <div className="d-flex justify-content-between align-items-start">
                    <div className="flex-grow-1">
                      <h5 className="card-title text-success fw-bold mb-2">{school.name}</h5>
                      <span className="badge bg-white text-success border border-success fs-6">
                        {school.points?.length || 0} نقطة حدودية
                      </span>
                    </div>
                    <span className="badge bg-success text-white fs-6">
                      مطابقة
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-5">
          <div className="text-muted mb-2">
            <i className="bi bi-building fs-1"></i>
          </div>
          <h5 className="text-dark">لا توجد مدارس مطابقة</h5>
          <p className="text-muted">لم يتم العثور على مدارس تطابق إحداثيات التواجد</p>
        </div>
      )}
    </div>
  </div>
);

const AttendanceRecords = () => {
  const [employee, setEmployee] = useState(null);
  const [arrayOfCoordinates, setArrayOfCoordinates] = useState([]);
  const [schoolList, setSchoolList] = useState([]);
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [employeeShow, setEmployeeShow] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeeData = await employeeLogIn();
        setEmployee(employeeData);
      } catch (error) {
        console.error("Error fetching employee data:", error);
        setError('فشل في تحميل بيانات الموظفين');
      }
    };
    fetchData();
  }, []);

  const handleAdminLogin = () => {
    if (password === process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('كلمة المرور غير صحيحة');
    }
  };

  const processPlaces = useCallback(async (employeeId) => {
    setLoading(true);
    setError('');
    setSelectedEmployee(employeeId);
    
    try {
      const selectedEmployee = employee?.find(emp => emp.id == employeeId);
      if (!selectedEmployee) {
        setError('الموظف غير موجود');
        return;
      }
      
      setEmployeeShow(selectedEmployee);

      const attendanceCoords = selectedEmployee.attendanceDepartures
        .filter(({ cordy, cordx }) => cordy && cordx)
        .map(({ cordy, cordx }) => [parseFloat(cordy), parseFloat(cordx)]);

      setArrayOfCoordinates(attendanceCoords);

      if (attendanceCoords.length === 0) {
        setSchoolList([]);
        return;
      }

      const placesData = await getPlaces();
      
      const matchedSchools = placesData.filter(place => {
        if (!place.points || place.points.length < 3) return false;
        
        const polygonCoords = place.points.map(point => 
          [parseFloat(point.cordx), parseFloat(point.cordy)]
        );
        
        try {
          const polygon = turf.polygon([polygonCoords]);
          return attendanceCoords.some(coord => 
            turf.booleanPointInPolygon(coord, polygon)
          );
        } catch (err) {
          console.warn('Invalid polygon for place:', place.name);
          return false;
        }
      });

      setSchoolList(matchedSchools);
    } catch (error) {
      console.error("Error processing places:", error);
      setError('فشل في معالجة البيانات الجغرافية');
    } finally {
      setLoading(false);
    }
  }, [employee]);

  if (!isAuthenticated) {
    return (
      <div className="min-vh-100 bg-light d-flex align-items-center" dir="rtl">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-5">
              <div className="card shadow-lg border-0">
                <div className="card-body p-5">
                  <div className="text-center mb-4">
                    <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '80px', height: '80px' }}>
                      <span className="text-white fs-2 fw-bold">ن</span>
                    </div>
                    <h2 className="card-title fw-bold text-dark mb-2">تسجيل دخول المسئول</h2>
                    <p className="text-muted">أدخل كلمة المرور للوصول إلى النظام</p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">كلمة المرور</label>
                    <input 
                      type="password" 
                      value={password} 
                      placeholder="أدخل كلمة مرور المسئول" 
                      className="form-control form-control-lg"
                      onChange={(e) => setPassword(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                    />
                  </div>
                  
                  <button 
                    onClick={handleAdminLogin}
                    className="btn btn-primary btn-lg w-100 fw-bold"
                  >
                    دخول إلى النظام
                  </button>
                  
                  {error && (
                    <div className="alert alert-danger mt-3 mb-0 text-center">
                      {error}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-light min-vh-100" dir="rtl">
      {/* Header */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-sm border-bottom">
        <div className="container">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-2 d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '50px', height: '50px' }}>
              <span className="text-white fw-bold fs-4">ن</span>
            </div>
            <div>
              <h1 className="navbar-brand h4 mb-0 fw-bold text-dark">نظام التحقق من مكان التوقيع</h1>
              <p className="text-muted small mb-0">نظام تتبع وتحليل مواقع التواجد للموظفين</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="btn btn-outline-secondary"
          >
            خروج من النظام
          </button>
        </div>
      </nav>

      <div className="container py-4">
        {error && (
          <div className="alert alert-danger alert-dismissible fade show mb-4" role="alert">
            {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        )}

        {/* Employee Selection Card */}
        <div className="card shadow-lg border-0 mb-4">
          <div className="card-header bg-white border-0">
            <h3 className="card-title h4 mb-0 fw-bold text-primary">اختر الموظف للتحقق</h3>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-8">
                <label htmlFor="employeeSelect" className="form-label fw-semibold text-dark">
                  اختر اسم الموجه من القائمة المنسدلة التالية
                </label>
                <select
                  id="employeeSelect"
                  value={selectedEmployee}
                  onChange={(e) => processPlaces(e.target.value)}
                  className="form-select form-select-lg"
                  disabled={loading || !employee}
                >
                  <option value="">
                    {loading ? "جاري تحميل بيانات الموظفين..." : "اختر موظف من القائمة"}
                  </option>
                  {employee?.map((emp) => (
                    <option key={emp.id} value={emp.id}>
                      {emp.employeeName}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {selectedEmployee && employeeShow && (
              <div className="alert alert-primary mt-3 mb-0">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <h5 className="alert-heading fw-bold mb-1">{employeeShow.employeeName}</h5>
                    <p className="mb-0">{arrayOfCoordinates.length} نقطة توقيع متاحة للتحقق</p>
                  </div>
                  <span className="badge bg-white text-primary fs-6">موظف نشط</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Statistics Card */}
        {selectedEmployee && (
          <StatisticsCard 
            coordinates={arrayOfCoordinates} 
            schools={schoolList} 
            employee={employeeShow} 
          />
        )}

        {/* Loading State */}
        {loading && (
          <div className="card shadow-lg border-0 mb-4">
            <div className="card-body text-center py-5">
              <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }} role="status">
                <span className="visually-hidden">جاري التحميل...</span>
              </div>
              <h4 className="text-dark fw-bold">جاري معالجة البيانات الجغرافية</h4>
              <p className="text-muted">قد تستغرق العملية بضع ثوانٍ</p>
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && selectedEmployee && (
          <div className="row g-4">
            <div className="col-lg-6">
              <CoordinateList coordinates={arrayOfCoordinates} />
            </div>
            <div className="col-lg-6">
              <SchoolList schools={schoolList} />
            </div>
          </div>
        )}

        {/* Empty State */}
        {!loading && !selectedEmployee && (
          <div className="card shadow-lg border-0">
            <div className="card-body text-center py-5">
              <div className="text-muted mb-3" style={{ fontSize: '4rem' }}>
                📍
              </div>
              <h3 className="card-title text-dark fw-bold mb-3">مرحباً في نظام تتبع التواجد</h3>
              <p className="text-muted lead mb-0">
                اختر موظفاً من القائمة المنسدلة أعلاه لبدء عملية التحقق من مواقع التواجد والمدارس المطابقة.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceRecords;
