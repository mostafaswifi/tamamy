"use client";
import { useEffect, useState, useCallback } from "react";
import * as turf from "@turf/turf";
import getPlaces from "@/lib/getPlaces";
import employeeLogIn from "../../lib/emloyeeLogIn";

// Statistics Component
const StatisticsCard = ({ coordinates, schools, employee }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
    <h2 className="text-2xl font-bold text-gray-800 mb-6 pb-4 border-b border-gray-100">إحصائيات التحقق</h2>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="text-center p-6 bg-blue-50 rounded-xl border border-blue-100">
        <div className="text-3xl font-bold text-blue-600 mb-2">{coordinates.length}</div>
        <div className="text-gray-700 font-medium">إجمالي الإحداثيات</div>
        <div className="text-gray-500 text-sm mt-2">نقطة توقيع</div>
      </div>
      
      <div className="text-center p-6 bg-green-50 rounded-xl border border-green-100">
        <div className="text-3xl font-bold text-green-600 mb-2">{schools.length}</div>
        <div className="text-gray-700 font-medium">المدارس المطابقة</div>
        <div className="text-gray-500 text-sm mt-2">مدرسة متطابقة</div>
      </div>
      
      <div className="text-center p-6 bg-purple-50 rounded-xl border border-purple-100">
        <div className="text-3xl font-bold text-purple-600 mb-2">
          {employee ? 1 : 0}
        </div>
        <div className="text-gray-700 font-medium">موظف محدد</div>
        <div className="text-gray-500 text-sm mt-2">حالة النشاط</div>
      </div>
    </div>
  </div>
);

// Enhanced sub-components with better spacing
const CoordinateList = ({ coordinates }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
    <div className="bg-blue-600 p-6">
      <h2 className="text-xl font-bold text-white">إحداثيات الموظف</h2>
    </div>
    <div className="p-6 max-h-96 overflow-y-auto">
      {coordinates.length > 0 ? (
        <div className="space-y-3">
          {coordinates.map(([lat, lng], idx) => (
            <div 
              key={idx} 
              className="flex items-center justify-between p-4 bg-blue-50 rounded-lg border border-blue-200 hover:bg-blue-100 transition-all duration-200 hover:shadow-sm"
            >
              <div className="flex items-center">
                <div className="w-3 h-3 bg-blue-500 rounded-full ml-4"></div>
                <span className="font-mono text-base text-gray-800">
                  {lat?.toFixed(6)}, {lng?.toFixed(6)}
                </span>
              </div>
              <span className="text-sm bg-white text-blue-700 px-3 py-2 rounded-full border border-blue-200 font-medium">
                نقطة #{idx + 1}
              </span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-2">لا توجد إحداثيات متاحة</p>
          <p className="text-gray-500">سيتم عرض الإحداثيات هنا بعد اختيار الموظف</p>
        </div>
      )}
    </div>
  </div>
);

const SchoolList = ({ schools }) => (
  <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
    <div className="bg-green-600 p-6">
      <h2 className="text-xl font-bold text-white">المدارس المطابقة</h2>
    </div>
    <div className="p-6">
      {schools.length > 0 ? (
        <div className="space-y-4">
          {schools.map((school, idx) => (
            <div 
              key={school.id || idx} 
              className="p-5 bg-green-50 rounded-xl border border-green-200 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="font-bold text-green-800 text-lg mb-3">{school.name}</h3>
                  <div className="flex items-center">
                    <span className="bg-white px-4 py-2 rounded-full border border-green-200 text-green-700 font-medium">
                      {school.points?.length || 0} نقطة حدودية
                    </span>
                  </div>
                </div>
                <div className="bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-bold border border-green-300">
                  مطابقة
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 text-lg mb-2">لا توجد مدارس مطابقة</p>
          <p className="text-gray-500">لم يتم العثور على مدارس تطابق إحداثيات التواجد</p>
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6" dir="rtl">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-3xl shadow-xl p-10 border border-gray-200">
            <div className="text-center mb-10">
              <div className="w-24 h-24 bg-gradient-to-r from-blue-500 to-blue-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <span className="text-white text-3xl font-bold">ن</span>
              </div>
              <h2 className="text-3xl font-bold text-gray-800 mb-3">تسجيل دخول المسئول</h2>
              <p className="text-gray-600 text-lg">أدخل كلمة المرور للوصول إلى النظام</p>
            </div>
            
            <div className="space-y-8">
              <div>
                <label className="block text-base font-medium text-gray-700 mb-4">
                  كلمة المرور
                </label>
                <input 
                  type="password" 
                  value={password} 
                  placeholder="أدخل كلمة مرور المسئول" 
                  className="w-full p-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 text-lg"
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
                />
              </div>
              
              <button 
                onClick={handleAdminLogin}
                className="w-full bg-blue-600 text-white p-5 rounded-2xl font-bold text-lg hover:bg-blue-700 transform hover:-translate-y-1 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                دخول إلى النظام
              </button>
              
              {error && (
                <div className="p-5 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-center text-lg font-medium">
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
    <div className="min-h-screen bg-gray-50" dir="rtl">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-5 space-x-reverse">
              <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-2xl">ن</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">نظام التحقق من مكان التوقيع</h1>
                <p className="text-gray-600 text-lg">نظام تتبع وتحليل مواقع التواجد للموظفين</p>
              </div>
            </div>
            
            <button 
              onClick={() => setIsAuthenticated(false)}
              className="px-8 py-4 bg-gray-100 text-gray-700 rounded-2xl hover:bg-gray-200 transition-colors duration-200 font-bold text-lg border border-gray-300"
            >
              خروج من النظام
            </button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-8">
        {error && (
          <div className="mb-8 p-6 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700 text-lg font-medium">
            {error}
          </div>
        )}

        {/* Employee Selection Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">اختر الموظف للتحقق</h2>
          
          <div className="space-y-6">
            <div>
              <label htmlFor="employeeSelect" className="block text-lg font-medium text-gray-700 mb-4">
                اختر اسم الموجه من القائمة المنسدلة التالية
              </label>
              <select
                id="employeeSelect"
                value={selectedEmployee}
                onChange={(e) => processPlaces(e.target.value)}
                className="w-full p-5 border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-200 focus:border-blue-500 transition-all duration-200 bg-white text-lg"
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

            {selectedEmployee && employeeShow && (
              <div className="p-6 bg-blue-50 rounded-2xl border-2 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-blue-800 text-xl mb-2">{employeeShow.employeeName}</h3>
                    <p className="text-blue-600 text-lg">
                      {arrayOfCoordinates.length} نقطة توقيع متاحة للتحقق
                    </p>
                  </div>
                  <div className="bg-white px-5 py-3 rounded-2xl text-lg text-blue-700 border-2 border-blue-300 font-bold">
                    موظف نشط
                  </div>
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
          <div className="flex flex-col items-center justify-center py-16 bg-white rounded-2xl shadow-lg border border-gray-200 mb-8">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
            </div>
            <p className="mt-6 text-xl text-gray-700 font-bold">جاري معالجة البيانات الجغرافية</p>
            <p className="text-gray-500 text-lg mt-3">قد تستغرق العملية بضع ثوانٍ</p>
          </div>
        )}

        {/* Results */}
        {!loading && selectedEmployee && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <CoordinateList coordinates={arrayOfCoordinates} />
            <SchoolList schools={schoolList} />
          </div>
        )}

        {/* Empty State */}
        {!loading && !selectedEmployee && (
          <div className="text-center py-20 bg-white rounded-2xl shadow-lg border border-gray-200">
            <h3 className="text-2xl font-bold text-gray-700 mb-4">مرحباً في نظام تتبع التواجد</h3>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto leading-relaxed">
              اختر موظفاً من القائمة المنسدلة أعلاه لبدء عملية التحقق من مواقع التواجد والمدارس المطابقة.
              سيعرض النظام الإحصائيات والإحداثيات والمدارس المتطابقة تلقائياً.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AttendanceRecords;
