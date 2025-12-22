import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { StudentGrade, StudentGradesStatistics } from "@/lib/hooks/use-student-grades"
import type { StudentTranscriptResponse } from "@/lib/hooks/use-student-transcript"

// Helper function to load and add logo
async function addLogoToPDF(doc: jsPDF, topMargin: number): Promise<number> {
  let logoHeight = 0
  try {
    const logoResponse = await fetch("/logo_student-removebg-preview.png")
    if (!logoResponse.ok) {
      throw new Error("Logo not found")
    }
    const logoBlob = await logoResponse.blob()
    const logoDataUrl = await new Promise<string>((resolve, reject) => {
      const reader = new FileReader()
      reader.onloadend = () => {
        if (reader.result && typeof reader.result === "string") {
          resolve(reader.result)
        } else {
          reject(new Error("Failed to convert logo to data URL"))
        }
      }
      reader.onerror = () => reject(new Error("Error reading logo file"))
      reader.readAsDataURL(logoBlob)
    })

    const pageWidth = doc.internal.pageSize.getWidth()
    const logoWidth = 50
    logoHeight = 50
    const logoX = (pageWidth - logoWidth) / 2 // Center the logo
    doc.addImage(logoDataUrl, "PNG", logoX, topMargin, logoWidth, logoHeight)
  } catch (error) {
    console.error("Error loading logo:", error)
  }
  return logoHeight
}

interface GenerateStudentGradesPDFOptions {
  grades: StudentGrade[]
  statistics: StudentGradesStatistics
  selectedSemester?: string
}

export async function generateStudentGradesPDF({
  grades,
  statistics,
  selectedSemester,
}: GenerateStudentGradesPDFOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const topMargin = 10
  const contentWidth = pageWidth - 2 * margin

  // Add logo at the very top
  const logoHeight = await addLogoToPDF(doc, topMargin)

  // School name and header
  const schoolName = "VOINJAMA MULTILATERAL HIGH SCHOOL"
  const headerText = "ACADEMIC GRADES REPORT"
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Header section - start below logo
  let yPos = topMargin + logoHeight + 10
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(schoolName, pageWidth / 2, yPos, { align: "center" })

  yPos += 8
  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.text(headerText, pageWidth / 2, yPos, { align: "center" })

  yPos += 10

  // Statistics section
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("ACADEMIC STATISTICS", margin, yPos)

  yPos += 6
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)

  const statsInfo = [
    [`Current GPA:`, statistics.currentGPA.toFixed(2)],
    [`Credits Earned:`, `${statistics.creditsEarned} / ${statistics.totalCreditsRequired}`],
    [`Average Grade:`, statistics.averageGrade],
  ]

  statsInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold")
    doc.text(label, margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(value, margin + 50, yPos)
    yPos += 5
  })

  // Semester filter info
  if (selectedSemester && selectedSemester !== "all") {
    yPos += 3
    doc.setFont("helvetica", "bold")
    doc.text(`Semester: ${selectedSemester}`, margin, yPos)
    yPos += 5
  }

  yPos += 5
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text(`Generated on: ${currentDate}`, pageWidth - margin, yPos, { align: "right" })

  yPos += 10

  // Grades table
  if (grades.length > 0) {
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("GRADES", margin, yPos)
    yPos += 5

    const tableData = grades.map((grade) => [
      grade.courseCode,
      grade.courseName,
      grade.grade,
      `${grade.score}%`,
      grade.credits.toString(),
      grade.semester,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Course Code", "Course Name", "Grade", "Score", "Credits", "Semester"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [139, 0, 0], // Maroon color
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: margin, right: margin },
      styles: {
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 25 }, // Course Code
        1: { cellWidth: 60 }, // Course Name
        2: { cellWidth: 20 }, // Grade
        3: { cellWidth: 20 }, // Score
        4: { cellWidth: 20 }, // Credits
        5: { cellWidth: 30 }, // Semester
      },
    })
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    )
    doc.text(
      "VOINJAMA MULTILATERAL HIGH SCHOOL - STRIVING FOR POSTERITY",
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    )
  }

  // Generate filename
  const semesterSuffix = selectedSemester && selectedSemester !== "all"
    ? `_${selectedSemester.replace(/\s+/g, "_")}`
    : ""
  const filename = `Grades${semesterSuffix}_${new Date().toISOString().split("T")[0]}.pdf`

  // Save PDF
  doc.save(filename)
}

export async function generateStudentTranscriptPDF(data: StudentTranscriptResponse): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const topMargin = 10

  // Add logo at the very top
  const logoHeight = await addLogoToPDF(doc, topMargin)

  // School name and header
  const schoolName = "VOINJAMA MULTILATERAL HIGH SCHOOL"
  const headerText = "OFFICIAL ACADEMIC TRANSCRIPT"
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  // Header section - start below logo
  let yPos = topMargin + logoHeight + 10
  doc.setFontSize(16)
  doc.setFont("helvetica", "bold")
  doc.text(schoolName, pageWidth / 2, yPos, { align: "center" })

  yPos += 8
  doc.setFontSize(14)
  doc.setFont("helvetica", "normal")
  doc.text(headerText, pageWidth / 2, yPos, { align: "center" })

  yPos += 10

  // Student information section
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("STUDENT INFORMATION", margin, yPos)

  yPos += 6
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)

  const studentInfo = [
    [`Name:`, data.studentName],
    [`Student ID:`, data.studentId],
    [`Email:`, data.email],
    [`Enrollment Date:`, new Date(data.enrollmentDate).toLocaleDateString("en-US")],
    [`Cumulative GPA:`, data.cumulativeGPA.toFixed(2)],
    [`Credits Earned:`, `${data.totalCreditsEarned} / ${data.totalCreditsRequired}`],
    [`Academic Standing:`, data.academicStanding],
  ]

  studentInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold")
    doc.text(label, margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(value, margin + 50, yPos)
    yPos += 5
  })

  yPos += 5
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text(`Generated on: ${currentDate}`, pageWidth - margin, yPos, { align: "right" })

  yPos += 10

  // Process each semester
  for (let i = 0; i < data.semesters.length; i++) {
    const semester = data.semesters[i]

    // Check if we need a new page
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = margin
    }

    // Semester header
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text(`${semester.semester} - GPA: ${semester.gpa.toFixed(2)}`, margin, yPos)
    yPos += 6

    // Semester courses table
    const tableData = semester.courses.map((course) => [
      course.code,
      course.name,
      course.credits.toString(),
      course.grade,
      course.score > 0 ? `${course.score}%` : "N/A",
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Course Code", "Course Name", "Credits", "Grade", "Score"]],
      body: tableData,
      theme: "striped",
      headStyles: {
        fillColor: [139, 0, 0], // Maroon color
        textColor: 255,
        fontStyle: "bold",
        fontSize: 9,
      },
      bodyStyles: {
        fontSize: 8,
        textColor: [0, 0, 0],
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },
      margin: { left: margin, right: margin },
      styles: {
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 30 }, // Course Code
        1: { cellWidth: 70 }, // Course Name
        2: { cellWidth: 20 }, // Credits
        3: { cellWidth: 20 }, // Grade
        4: { cellWidth: 20 }, // Score
      },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Footer
  const totalPages = doc.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i)
    doc.setFontSize(8)
    doc.setFont("helvetica", "normal")
    doc.text(
      `Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 10,
      { align: "center" }
    )
    doc.text(
      "VOINJAMA MULTILATERAL HIGH SCHOOL - STRIVING FOR POSTERITY",
      pageWidth / 2,
      pageHeight - 5,
      { align: "center" }
    )
  }

  // Generate filename
  const filename = `Transcript_${data.studentId}_${new Date().toISOString().split("T")[0]}.pdf`

  // Save PDF
  doc.save(filename)
}

