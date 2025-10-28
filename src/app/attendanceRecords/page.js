"use client";
import { useEffect, useState, useCallback } from "react";
import * as turf from "@turf/turf";
import getPlaces from "@/lib/getPlaces";
import employeeLogIn from "../../lib/emloyeeLogIn";

// Enhanced sub-components without icons
const CoordinateList = ({ coordinates }) => (
  <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
    <div className="bg-blue-500 p-4">
      <h2 className="text-lg font-bold text-white">
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
          <p className="text-gray-500 text-lg">لا توجد إحداثيات متاحة</p>
        </div>
      )}
    </div>
  </div>
);

const SchoolList = ({ schools, employeeData }) => (
  <div className="mt-8 bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
    <div className="bg-green-500 p-4">
      <h2 className="text-lg font-bold text-white">
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
                  <h3 className="font-bold text-green-800 text-lg mb-2">
                    {school.name}
                  </h3>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="bg-white px-3 py-1 rounded-full border border-green-200">
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
                <span className="text-white text-2xl font-bold">ق</span>
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
                <span className="text-white font-bold text-lg">ن</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-800">نظام التحقق من مكان التوقيع</h1>
                <p className="text-gray-600">نظام تتبع وتحليل مواقع التواجد</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors duration-200 font-medium"
            >
              خروج
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto p-4">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 animate-fade-in">
            {error}
          </div>
        )}

        {/* Employee Selection Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6 mb-6">
          <div className="mb-4">
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
