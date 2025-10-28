"use client";
import { useEffect, useState, useCallback } from "react";
import * as turf from "@turf/turf";
import getPlaces from "@/lib/getPlaces";
import employeeLogIn from "../../lib/emloyeeLogIn";

// Define the sub-components outside the main component or inside it
const CoordinateList = ({ coordinates }) => (
  <div className="mt-6">
    <h2 className="text-lg font-semibold mb-2">إحداثيات الموظف:</h2>
    {coordinates.length > 0 ? (
      <ul className="space-y-2 max-h-60 overflow-y-auto">
        {coordinates.map(([lat, lng], idx) => (
          <li key={idx} className="p-2 bg-gray-100 rounded text-sm">
            {lat?.toFixed(6)}, {lng?.toFixed(6)}
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500">لا توجد إحداثيات متاحة</p>
    )}
  </div>
);

const SchoolList = ({ schools, employeeData }) => (
  <div className="mt-6">
    <h2 className="text-lg font-semibold mb-2">المدارس المطابقة:</h2>
    {schools.length > 0 ? (
      <ul className="space-y-3">
        {schools.map((school, idx) => (
          <li key={school.id || idx} className="p-3 bg-green-50 border border-green-200 rounded">
            <h3 className="font-medium text-green-800">{school.name}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {school.points?.length || 0} نقطة حدودية
            </p>
          </li>
        ))}
      </ul>
    ) : (
      <p className="text-gray-500">لا توجد مدارس مطابقة لإحداثيات الموظف</p>
    )}
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
    // In production, this should be a backend call
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
      <div className="container mx-auto p-4" dir="rtl">
        <div className="max-w-md mx-auto mt-10">
          <h2 className="text-xl font-bold mb-6 text-center">تسجيل دخول المسئول</h2>
          <div className="space-y-4">
            <input 
              type="password" 
              value={password} 
              placeholder="أدخل كلمة مرور المسئول" 
              className="form-control w-full p-2 border rounded"
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAdminLogin()}
            />
            <button 
              onClick={handleAdminLogin}
              className="w-full p-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              دخول
            </button>
            {error && <p className="text-red-500 text-center">{error}</p>}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4" dir="rtl">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-xl font-bold">نظام التحقق من مكان التوقيع</h1>
        <button 
          onClick={() => setIsAuthenticated(false)}
          className="p-2 bg-gray-500 text-white rounded hover:bg-gray-600"
        >
          خروج
        </button>
      </div>

      {error && (
        <div className="p-3 bg-red-100 text-red-700 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label htmlFor="employeeSelect" className="block mb-2 font-medium">
          اختر اسم الموجه من القائمة المنسدلة التالية
        </label>
        <select
          id="employeeSelect"
          onChange={(e) => processPlaces(e.target.value)}
          className="w-full p-2 border rounded"
          disabled={loading || !employee}
        >
          <option value="">
            {loading ? "جاري التحميل..." : "اختر موظف"}
          </option>
          {employee?.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.employeeName}
            </option>
          ))}
        </select>
      </div>

      {loading && (
        <div className="flex justify-center items-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
          <span className="mr-2">جاري المعالجة...</span>
        </div>
      )}

      <CoordinateList coordinates={arrayOfCoordinates} />
      <SchoolList schools={schoolList} employeeData={employeeShow} />
    </div>
  );
};

export default AttendanceRecords;
