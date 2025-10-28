'use client'
import React, { useEffect, useState } from "react";
import Swal from 'sweetalert2'
import addPlace from "@/lib/addPlace";

const AddSchool = () => {
  const admin = '123456';
  const [flag, setFlag] = useState(false);
  const [adminPassword, setAdminPassword] = useState("");
  const [schoolName, setSchoolName] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [polygonPoints, setPolygonPoints] = useState([]);

  // State for all points
  const [points, setPoints] = useState([
    { x: "", y: "" },
    { x: "", y: "" },
    { x: "", y: "" },
    { x: "", y: "" },
    { x: "", y: "" }
  ]);

  useEffect(() => {
    setPolygonPoints(
      points.filter(point => point.x && point.y).map(point => ({
        cordx: point.x,
        cordy: point.y,
      }))
    );
  }, [points]);

  const handlePointChange = (index, field, value) => {
    const newPoints = [...points];
    newPoints[index][field] = value;
    setPoints(newPoints);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate all required fields
    const requiredFields = [schoolName, ...points.flatMap(point => [point.x, point.y])];
    const isValid = requiredFields.every(field => field.trim() !== "");
    
    if (!isValid) {
      Swal.fire({
        title: 'خطأ!',
        text: 'يرجى ملء جميع الحقول بشكل صحيح',
        icon: 'error',
        confirmButtonText: 'حاول مرة أخرى'
      });
      return;
    }

    try {
      await addPlace(schoolName, polygonPoints);
      
      // Reset form
      setSchoolName("");
      setPlaceId("");
      setPoints([
        { x: "", y: "" },
        { x: "", y: "" },
        { x: "", y: "" },
        { x: "", y: "" },
        { x: "", y: "" }
      ]);
      setPolygonPoints([]);

      Swal.fire({
        title: 'تمت الإضافة!',
        text: 'تم إضافة المدرسة بنجاح',
        icon: 'success',
        confirmButtonText: 'تم'
      });
    } catch (error) {
      Swal.fire({
        title: 'خطأ!',
        text: 'حدث خطأ أثناء إضافة المدرسة',
        icon: 'error',
        confirmButtonText: 'حاول مرة أخرى'
      });
    }
  };

  const resetForm = () => {
    setSchoolName("");
    setPlaceId("");
    setPoints([
      { x: "", y: "" },
      { x: "", y: "" },
      { x: "", y: "" },
      { x: "", y: "" },
      { x: "", y: "" }
    ]);
    setAdminPassword("");
    setFlag(false);
  };

  return (
    <div className="bg-light min-vh-100" dir="rtl">
      {/* Header */}
      <nav className="navbar navbar-light bg-white shadow-sm border-bottom">
        <div className="container">
          <div className="d-flex align-items-center">
            <div className="bg-primary rounded-2 d-flex align-items-center justify-content-center me-3" 
                 style={{ width: '45px', height: '45px' }}>
              <span className="text-white fw-bold fs-5">م</span>
            </div>
            <div>
              <h1 className="navbar-brand h5 mb-0 fw-bold text-dark">نظام إدارة المدارس</h1>
              <p className="text-muted small mb-0">إضافة مدارس جديدة وتحديد حدودها الجغرافية</p>
            </div>
          </div>
        </div>
      </nav>

      <div className="container py-4">
        {/* Admin Authentication */}
        {!flag && (
          <div className="row justify-content-center">
            <div className="col-lg-6">
              <div className="card shadow-lg border-0">
                <div className="card-body p-4">
                  <div className="text-center mb-4">
                    <div className="bg-primary rounded-circle d-inline-flex align-items-center justify-content-center mb-3" 
                         style={{ width: '70px', height: '70px' }}>
                      <span className="text-white fw-bold fs-3">ق</span>
                    </div>
                    <h3 className="card-title text-primary fw-bold mb-2">الدخول كمسؤول</h3>
                    <p className="text-muted">أدخل كلمة مرور المسؤول للمتابعة</p>
                  </div>
                  
                  <div className="mb-3">
                    <label className="form-label fw-semibold text-dark">كلمة المرور</label>
                    <input
                      type="password"
                      className="form-control form-control-lg"
                      placeholder="أدخل كلمة مرور المسؤول"
                      value={adminPassword}
                      onChange={(e) => {
                        setAdminPassword(e.target.value);
                        if (e.target.value === admin) setFlag(true);
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Add School Form */}
        {flag && (
          <div className="card shadow-lg border-0">
            <div className="card-header bg-white border-0 py-4">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="card-title h4 fw-bold text-primary mb-1">إضافة مدرسة جديدة</h2>
                  <p className="text-muted mb-0">أدخل بيانات المدرسة والإحداثيات الجغرافية</p>
                </div>
                <button 
                  className="btn btn-outline-secondary"
                  onClick={resetForm}
                >
                  خروج
                </button>
              </div>
            </div>

            <div className="card-body p-4">
              <form onSubmit={handleSubmit}>
                {/* School Name */}
                <div className="row mb-4">
                  <div className="col-lg-6">
                    <div className="mb-3">
                      <label htmlFor="schoolName" className="form-label fw-semibold text-dark">
                        اسم المدرسة <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        className="form-control form-control-lg"
                        id="schoolName"
                        value={schoolName}
                        onChange={(e) => setSchoolName(e.target.value)}
                        placeholder="أدخل اسم المدرسة"
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* Coordinates Section */}
                <div className="mb-4">
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold text-dark mb-0">الإحداثيات الجغرافية للمضلع</h5>
                    <span className="badge bg-primary fs-6">5 نقاط مطلوبة</span>
                  </div>
                  
                  <div className="row g-3">
                    {points.map((point, index) => (
                      <div key={index} className="col-md-6 col-lg-4">
                        <div className="card border-0 bg-light hover-shadow">
                          <div className="card-body">
                            <h6 className="card-title fw-semibold text-primary mb-3">
                              النقطة {index + 1}
                            </h6>
                            <div className="row g-2">
                              <div className="col-6">
                                <label className="form-label small fw-semibold text-muted">الإحداثي X</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={point.x}
                                  onChange={(e) => handlePointChange(index, 'x', e.target.value)}
                                  placeholder={`X${index + 1}`}
                                  required
                                />
                              </div>
                              <div className="col-6">
                                <label className="form-label small fw-semibold text-muted">الإحداثي Y</label>
                                <input
                                  type="text"
                                  className="form-control"
                                  value={point.y}
                                  onChange={(e) => handlePointChange(index, 'y', e.target.value)}
                                  placeholder={`Y${index + 1}`}
                                  required
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="row mt-4">
                  <div className="col-12">
                    <div className="d-flex gap-3">
                      <button 
                        type="submit" 
                        className="btn btn-primary btn-lg fw-bold px-5"
                      >
                        إضافة المدرسة
                      </button>
                      <button 
                        type="button" 
                        className="btn btn-outline-secondary btn-lg"
                        onClick={resetForm}
                      >
                        إلغاء
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </div>

            {/* Form Status */}
            <div className="card-footer bg-light border-0 py-3">
              <div className="row">
                <div className="col-12">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <span className="text-muted small">
                        الحقول marked with <span className="text-danger">*</span> إلزامية
                      </span>
                    </div>
                    <div className="text-end">
                      <span className={`badge ${polygonPoints.length === 5 ? 'bg-success' : 'bg-warning'} fs-6`}>
                        {polygonPoints.length}/5 نقاط محددة
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        {flag && (
          <div className="card border-0 bg-primary text-white mt-4">
            <div className="card-body">
              <h6 className="card-title fw-bold mb-3">تعليمات هامة:</h6>
              <ul className="list-unstyled mb-0">
                <li className="mb-2">• تأكد من صحة الإحداثيات الجغرافية المدخلة</li>
                <li className="mb-2">• يجب إدخال 5 نقاط على الأقل لتشكيل مضلع</li>
                <li className="mb-2">• النقاط يجب أن تشكل مضلعاً مغلقاً حول المدرسة</li>
                <li>• يمكنك الحصول على الإحداثيات من خرائط جوجل أو أنظمة GPS</li>
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default AddSchool;
