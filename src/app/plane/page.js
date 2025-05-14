'use client'
import React, {  useEffect, useState } from "react";
import Swal from 'sweetalert2'
import addPlace from "@/lib/addPlace";

const page = () => {
  const admin = '123456'
  const [flag, setFlag] = useState(false);
  const [schoolName, setSchoolName] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [polygonPoints, setPolygonPoints] = useState([
  
  ]);

  const [pointx1, setPointx1] = useState("");
  const [pointy1, setPointy1] = useState("");
  const [pointx2, setPointx2] = useState("");
  const [pointy2, setPointy2] = useState("");
  const [pointx3, setPointx3] = useState("");
  const [pointy3, setPointy3] = useState("");
  const [pointx4, setPointx4] = useState("");
  const [pointy4, setPointy4] = useState("");
  const [pointx5, setPointx5] = useState("");
  const [pointy5, setPointy5] = useState("");



useEffect(() => {
    setPolygonPoints([
 
      {
 
        cordx: pointx1,
        cordy: pointy1,
      },
      {
     
        cordx: pointx2,
        cordy: pointy2,
      },
      {
   
        cordx: pointx3,
        cordy: pointy3,
      },
      {

        cordx: pointx4,
        cordy: pointy4,
      },
      {

        cordx: pointx5,
        cordy: pointy5,
      }
    ]);
  }, [pointx1, pointy1, pointx2, pointy2, pointx3, pointy3, pointx4, pointy4, pointx5, pointy5]);

  console.log(polygonPoints)
  const handleSubmit = async (e) => {
    e.preventDefault();
    await addPlace(schoolName, placeId, polygonPoints);
    setSchoolName("");
    setPlaceId("");
    setPolygonPoints([]);
    setPointx1("");
    setPointy1("");
    setPointx2("");
    setPointy2("");
    setPointx3("");
    setPointy3("");
    setPointx4("");
    setPointy4("");
    setPointx5("");
    setPointy5("");
    Swal.fire({
      title: 'تمت الإضافة!',
      text: 'عملية ناجحة',
      icon: 'success',
      confirmButtonText: 'تم'
    });
    setFlag(false);
  };

  return (
    <div className="container" dir="rtl">

     {!flag &&
     <section className="my-5">
     <label htmlFor="admin">كلمة المرور</label>
     <input type="text" className="form-control my-3" onChange={(e) => e.target.value === admin? setFlag(true) : setFlag(false)}
     
     /></section>}

      {flag && ( 
        
        <main className="container my-5">
        <h1>إضافة مدرسة جديدة</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group my-3">
          <label htmlFor="schoolName">اسم المدرسة</label>
          <input
            type="text"
            className="form-control"
            id="schoolName"
            value={schoolName}
            onChange={(e) => setSchoolName(e.target.value)}
            required
          />
        </div>
 
        <div className="form-group">
          <label htmlFor="polygonPoints">أدخل إحداثيات نقاط المضلع:</label>

         <div className="row">

          <div className="col d-flex flex-column gap-2">

          <label htmlFor="pointx1">X1</label>
          <input type ="text" className="form-control" value={pointx1} onChange={(e) => setPointx1(e.target.value)} />
          <label htmlFor="pointy1">Y1</label>
          <input type ="text" className="form-control" value={pointy1} onChange={(e) => setPointy1(e.target.value)} />
          </div>
          <div className="col d-flex flex-column gap-2">
          <label htmlFor="pointx2">X2</label>
          <input type ="text" className="form-control" value={pointx2} onChange={(e) => setPointx2(e.target.value)} />
          <label htmlFor="pointy2">Y2</label>
          <input type ="text" className="form-control" value={pointy2} onChange={(e) => setPointy2(e.target.value)} />
          </div>
          <div className="col d-flex flex-column gap-2">
          <label htmlFor="pointx3">X3</label>
          <input type ="text" className="form-control" value={pointx3} onChange={(e) => setPointx3(e.target.value)} />
          <label htmlFor="pointy3">Y3</label>
          <input type ="text" className="form-control" value={pointy3} onChange={(e) => setPointy3(e.target.value)} />
          </div>
          <div className="col d-flex flex-column gap-2">
          <label htmlFor="pointx4">X4</label>
          <input type ="text" className="form-control" value={pointx4} onChange={(e) => setPointx4(e.target.value)} />
          <label htmlFor="pointy4">Y4</label>
          <input type ="text" className="form-control" value={pointy4} onChange={(e) => setPointy4(e.target.value)} />
          </div>
          <div className="col d-flex flex-column gap-2">
          <label htmlFor="pointx5">X5</label>
          <input type ="text" className="form-control" value={pointx5} onChange={(e) => setPointx5(e.target.value)} />
          <label htmlFor="pointy5">Y5</label>
          <input type ="text" className="form-control" value={pointy5} onChange={(e) => setPointy5(e.target.value)} />
          </div>
         </div>
        </div>
        <button type="submit" className="btn btn-primary my-3" >
إضافة مدرسة
        </button>
      </form>
      </main>)}
    </div>
  );
}

export default page;
