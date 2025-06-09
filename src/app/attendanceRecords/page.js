"use client";
import { useEffect, useState, useCallback } from "react";
import * as turf from "@turf/turf";
import getPlaces from "@/lib/getPlaces";
import employeeLogIn from "../../lib/emloyeeLogIn";
import { set } from "date-fns";

const Page = () => {
  const [employee, setEmployee] = useState(null);
  const [arrayOfCoordinates, setArrayOfCoordinates] = useState([]);
  const [schoolList, setSchoolList] = useState([]);
  const [places, setPlaces] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [employeeShow, setEmployeeShow] = useState(null);
  const adminPassword = process.env.NEXT_PUBLIC_SUPER_ADMIN_PASSWORD;



  // Fetch employee data on component mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const employeeData = await employeeLogIn();
        setEmployee(employeeData);
      } catch (error) {
        console.error("Error fetching employee data:", error);
      }
    };
    fetchData();
  }, []);

  // Check if coordinates are within polygon boundaries
  const checkCoordinatesInPolygon = useCallback((polygon, coordinates) => {
    return coordinates.map(coord => 
      turf.booleanPointInPolygon(coord, polygon)
    );
  }, []);

  // Main function to process places and check coordinates
  const processPlaces = useCallback(async (employeeId) => {
    
    setLoading(true);
    try {
      const selectedEmployee = employee?.find(emp => emp.id == employeeId);
      if (!selectedEmployee) return;
      setEmployeeShow(selectedEmployee);
      console.log(selectedEmployee?.attendanceDepartures.map(a=> a?.createdAt))

      // Get employee's attendance coordinates
      const attendanceCoords = selectedEmployee.attendanceDepartures.map(
        ({ cordx, cordy }) => [cordx, cordy]
      );
      setArrayOfCoordinates(attendanceCoords);

      // Get all places data
      const placesData = await getPlaces();
      setPlaces(placesData);

      // Process each place's polygon
      const results = placesData.map(place => {
        const polygonCoords = place.points.map(point => [point.cordx, point.cordy]);
        if (polygonCoords.length < 3) return null; // Skip invalid polygons

        const polygon = turf.polygon([polygonCoords]);
        const isInsideArray = checkCoordinatesInPolygon(polygon, attendanceCoords);
        
        return {
          place,
          isInsideArray
        };
      }).filter(Boolean);

      // Filter schools with at least one matching coordinate
      const matchedSchools = results
        .filter(({ isInsideArray }) => isInsideArray.some(Boolean))
        .map(({ place }) => place);

      setSchoolList(matchedSchools);
     
    } catch (error) {
      console.error("Error processing places:", error);
    } finally {
      setLoading(false);
    }
  }, [employee, checkCoordinatesInPolygon]);

  return (
    <div className="container mx-auto p-4">
      <input type="password" value={password} placeholder="اخل كلمة مرور المسئول" className="form-control mb-3" onChange={(e) => setPassword(e.target.value)} />
      {password == adminPassword &&
<div className="p-4" dir="rtl">
      <h1 className="text-xl font-bold mb-4">نظام التحقق من مكان التوقيع</h1>
      
      <div className="mb-4">
        <label htmlFor="employeeSelect" className="block mb-2 form-label">
          اختر اسم الموجه من القائمة المنسدلة التالية
        </label>
        <select
          id="employeeSelect"
          onChange={(e) => processPlaces(e.target.value)}
          className="w-full p-2 border rounded form-control"
          disabled={loading}
        >
          <option value="">{loading ? "Loading..." : "Select an employee"}</option>
          {employee?.map((emp) => (
            <option key={emp.id} value={emp.id}>
              {emp.employeeName}
            </option>
          ))}
        </select>
      </div>

      {loading && <p className="text-blue-500">جاري المعالجة...</p>}

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">إحداثيات الموظف:</h2>
        {arrayOfCoordinates.length > 0 ? (
          <ul className="space-y-2">
            {arrayOfCoordinates.map(([lat, lng], idx) => (
              <li key={idx} className="p-2 bg-gray-100 rounded">
                {lat}, {lng}
              </li>
            ))}
          </ul>
        ) : (
          <p>لا توجد إحداثيات متاحة</p>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-lg font-semibold mb-2">المدارس المطابقة:</h2>
        {schoolList.length > 0 ? (
          <ul className="space-y-2">
            {schoolList.map((school, idx) => (
              <li key={idx} className="p-3 bg-green-50 border border-green-100 rounded">
                <h3 className="font-medium">{school.name}</h3>
                {/* {<h2>{employeeShow?.attendanceDepartures.map((a,idx)=> <p key={idx}>{ a[idx] == idx ? a.createdAt :  null}</p>)}</h2>} */}
                {employeeShow?.attendanceDepartures[idx]?.createdAt}
                <p className="text-sm text-gray-600">
                  {school?.points.length} نقطة حدودية
                </p>
                {/* <p>{school}</p> */}
              </li>
            ))}
          </ul>
        ) : (
          <p>لا توجد مدارس مطابقة لإحداثيات الموظف</p>
        )}
      </div>
    </div>
      }
      </div>
  );
};

export default Page;