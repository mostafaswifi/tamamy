 import * as XLSX from 'xlsx';
 const handleExcelDownload = async (apiUrl,filename ) => {
    try {
      // 1. Fetch data from the API endpoint
      const response = await fetch(apiUrl);
      if (!response.ok) {
        console.error(`Failed to fetch data: ${response.statusText}`);
        alert(`Failed to fetch data: ${response.statusText}`);
        return;
      }
      const data = await response.json(); // Assuming API returns JSON array of objects

      // 2. Convert JSON data to a worksheet
      // XLSX.utils.json_to_sheet is great for arrays of objects
      const worksheet = XLSX.utils.json_to_sheet(data);

      // 3. Create a new workbook and append the worksheet
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1'); // 'Sheet1' is the sheet name

      // 4. Generate Excel file in array buffer format
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

      // 5. Create a Blob from the buffer and trigger download
      const excelBlob = new Blob([excelBuffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
      });
      const url = window.URL.createObjectURL(excelBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename; // Set the desired download filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url); // Clean up the URL object

    } catch (error) {
      console.error('Error fetching and generating Excel:', error);
      alert('Failed to fetch and generate Excel file. Check console for details.');
    }
  };

  export default handleExcelDownload;