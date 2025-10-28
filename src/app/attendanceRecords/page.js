"use client";
import { useEffect, useState, useCallback } from "react";
import * as turf from "@turf/turf";
import getPlaces from "@/lib/getPlaces";
import employeeLogIn from "../../lib/emloyeeLogIn";

// Enhanced sub-components with better UI
const CoordinateList = ({ coordinates }) => (
  <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 p-4">
      <h2 className="text-lg font-bold text-white flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
        </svg>
        إحداثيات الموظف
      </h2>
    </div>
    <div className="p-4 max-h-80 overflow-y-auto">
      {coordinates.length > 0 ? (
        <div className="grid gap-2">
          {coordinates.map(([lat, lng], idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-100 hover:bg-blue-100 transition-colors duration-200"
            >
              <div className="flex items-center">
                <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                <span className="font-mono text-sm text-gray-700">
                  {lat?.toFixed(6)}, {lng?.toFixed(6)}
                </span>
              </div>
              <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <svg className="w-16 h-16 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
          </svg>
          <p className="text-gray-500">لا توجد إحداثيات متاحة</p>
        </div>
      )}
    </div>
  </div>
);

const SchoolList = ({ schools, employeeData }) => (
  <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
    <div className="bg-gradient-to-r from-green-500 to-green-600 p-4">
      <h2 className="text-lg font-bold text-white flex items-center">
        <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
        </svg>
        المدارس المطابقة
      </h2>
    </div>
    <div className="p-4">
      {schools.length > 0 ? (
        <div className="grid gap-4">
          {schools.map((school, idx) => (
            <div 
              key={school.id || idx} 
              className="p-4 bg-green-50 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-green-800 text-lg mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    {school.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="bg-white px-3 py-1 rounded-full border border-green-200 flex items-center">
                      <svg className="w-4 h-4 mr-1 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      </svg>
                      {school.points?.length || 0} نقطة حدودية
                    </span>
                  </div>
                </div>
                <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-sm font-medium">
                  مطابقة
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <svg className="w-20 h-20 mx-auto text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-gray-500 text-lg">لا توجد مدارس مطابقة لإحداثيات الموظف</p>
          <p className="text-gray-400 text-sm mt-2">تأكد من صحة الإحداثيات أو حدود المدارس</p>
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4" dir="rtl">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-2xl p-8 transform transition-all duration-300 hover:shadow-2xl">
            <div className="text-center mb-8">
              <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h2 className="text-2xl font-bold text-gray-800">تسجيل دخول المسئول</h2>
              <p className="text-gray-600 mt-2">أدخل كلمة المرور للوصول إلى النظام</p>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  كلمة المرور
                </label>
                <input 
                  type="password" 
                  value={password} 
                  placeholder="أدخل كلمة مرور المسئول" 
                  className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>
              
              <button 
                onClick={handleAdminLogin}
                className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white p-4 rounded-2xl font-semibold hover:from-blue-600 hover:to-purple-700 transform hover:-translate-y-0.5 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                دخول
              </button>
              
              {error && (
                <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-center animate-pulse">
                  {error}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4 space-x-reverse">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">نظام التحقق من مكان التوقيع</h1>
                <p className="text-gray-600">نظام تتبع وتحليل مواقع التواجد</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="flex items-center space-x-2 space-x-reverse px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              <span>خروج</span>
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 animate-fade-in">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          </div>
        )}

        {/* Employee Selection Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="flex items-center mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center mr-3">
              <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-gray-800">اختر الموظف</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="employeeSelect" className="block text-sm font-medium text-gray-700 mb-2">
                اختر اسم الموجه من القائمة المنسدلة التالية
              </label>
              <select
                id="employeeSelect"
                value={selectedEmployee}
                onChange={(e) => processPlaces(e.target.value)}
                className="w-full p-4 border border-gray-300 rounded-2xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 bg-white"
                disabled={loading || !employee}
              >
                <option value="">
                  {loading ? "جاري التحميل..." : "اختر موظف من القائمة"}
                </option>
                {employee?.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.employeeName}
                  </option>
                ))}
              </select>
            </div>

            {selectedEmployee && employeeShow && (
              <div className="p-4 bg-blue-50 rounded-xl border border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-blue-800">{employeeShow.employeeName}</h3>
                    <p className="text-sm text-blue-600">
                      {arrayOfCoordinates.length} نقطة توقيع متاحة
                    </p>
                  </div>
                  <div className="bg-white px-3 py-1 rounded-full text-sm text-blue-700 border border-blue-200">
                    نشط
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-12 bg-white rounded-2xl shadow-lg border border-gray-100 mb-6">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-500 rounded-full animate-spin"></div>
              <div className="absolute inset-0 flex items-center justify-center">
                <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                </svg>
              </div>
            </div>
            <p className="mt-4 text-lg text-gray-700 font-medium">جاري معالجة البيانات الجغرافية...</p>
            <p className="text-gray-500 mt-2">قد تستغرق العملية بضع ثوانٍ</p>
          </div>
        )}

        {/* Results */}
        {!loading && selectedEmployee && (
          <div className="space-y-6">
            <CoordinateList coordinates={arrayOfCoordinates} />
            <SchoolList schools={schoolList} employeeData={employeeShow} />
          </div>
        )}

        {/* Empty State */}
        {!loading && !selectedEmployee && (
          <div className="text-center py-16 bg-white rounded-2xl shadow-lg border border-gray-100">
            <svg className="w-24 h-24 mx-auto text-gray-300 mb-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <h3 className="text-xl font-bold text-gray-600 mb-3">مرحباً في نظام التتبع</h3>
            <p className="text-gray-500 max-w-md mx-auto">
              اختر موظفاً من القائمة المنسدلة أعلاه لبدء عملية التحقق من مواقع التواجد والمدارس المطابقة.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceRecords;
