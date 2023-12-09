import React, { useState } from 'react'
import html2pdf from 'html2pdf.js';


const ReportGeneration = ({imageSrc}) => {
console.log("HI")
    const [showNames, setShowNames] = useState(false);

    const details = {
      companyTitle: "Your Company",
      patientName: "John Doe",
      hospitalName: "Hospital XYZ",
      date: "2023-11-30",
      time: "10:00 AM",
      loginId: "12345",
      sensorId: "67890",
      doctorName: "Dr. Smith",
      assistantName: "Jane Doe",
      graphImage: "path/to/graph.png",
    };
  
    const handleShowNames = () => {
      setShowNames(!showNames);
    };
  
    const generatePdf = () => {
      const content = document.getElementById("pdf-content");
  
      html2pdf(content, {
        margin: 10,
        filename: "details.pdf",
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
      });
    };

  return (
    <div id="pdf-content" className="mt-5"  >
        <style>
          {`
            @font-face {
              font-family: 'Poppins';
              font-style: normal;
              font-weight: 400;
              src: url('https://fonts.gstatic.com/s/poppins/v15/pxiByp8kv8JHgFVrLGT9Z1xlFd2JQEk.woff2') format('woff2');
            }
            @font-face {
              font-family: 'Poppins';
              font-style: normal;
              font-weight: 700;
              src: url('https://fonts.gstatic.com/s/poppins/v15/pxiEyp8kv8JHgFVrJJfecnFHGPc.woff2') format('woff2');
            }

            body {
              font-family: 'Poppins', sans-serif;
              margin: 20mm;
              padding: 10px;
              box-sizing: border-box;
            }

            h1 {
              font-size: 24px;
              font-weight: 700;
              text-align: center;
              margin-bottom: 20px;
            }

            p {
              font-size: 14px;
              margin-bottom: 10px;
            }
          `}
        </style>

        <div className="pdf-border">
          <h1>{details.companyTitle}</h1>
          <p>Patient Name: {details.patientName}</p>
          <p>Hospital Name: {details.hospitalName}</p>
          <p>Date: {details.date}</p>
          <p>Time: {details.time}</p>
          <p>Login ID: {details.loginId}</p>
          <p>Sensor ID: {details.sensorId}</p>
          {showNames && (
            <>
              <p>Doctor Name: {details.doctorName}</p>
              <p>Assistant Name: {details.assistantName}</p>
            </>
          )}
         
          <img src={imageSrc} alt="" className="w-[600px] h-[400px]"/>
        </div>
      </div>
  )
}

export default ReportGeneration