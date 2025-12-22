import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import type { Child } from "@/lib/hooks/use-parent-dashboard"
import type { StudentGrade, StudentGradesStatistics } from "@/lib/hooks/use-student-grades"
import type { StudentTranscriptResponse } from "@/lib/hooks/use-student-transcript"

interface GenerateGradesPDFOptions {
  student: Child
  selectedSemesterName?: string
  filteredGrades: Child["grades"]
  filteredEnrollments: Child["enrollments"]
}

export async function generateGradesPDF({
  student,
  selectedSemesterName,
  filteredGrades,
  filteredEnrollments,
}: GenerateGradesPDFOptions): Promise<void> {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20
  const topMargin = 10 // Smaller top margin for logo
  const contentWidth = pageWidth - 2 * margin

  // Load and add logo at the very top
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

    // Add logo at the very top, centered
    const logoWidth = 50
    logoHeight = 50
    const logoX = (pageWidth - logoWidth) / 2 // Center the logo
    doc.addImage(logoDataUrl, "PNG", logoX, topMargin, logoWidth, logoHeight)
  } catch (error) {
    console.error("Error loading logo:", error)
    // Continue without logo if it fails
  }

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

  // Student information section
  doc.setFontSize(10)
  doc.setFont("helvetica", "bold")
  doc.text("STUDENT INFORMATION", margin, yPos)

  yPos += 6
  doc.setFont("helvetica", "normal")
  doc.setFontSize(9)

  const studentInfo = [
    [`Name:`, `${student.firstName} ${student.lastName}`],
    [`Student ID:`, student.studentId],
    [`Program:`, student.program || "N/A"],
    [`Year of Study:`, student.yearOfStudy?.toString() || "N/A"],
    [`Cumulative GPA:`, student.cumulativeGPA.toFixed(2)],
    [`Semester GPA:`, student.semesterGPA.toFixed(2)],
    [`Credits Earned:`, `${student.totalCreditsEarned} / ${student.totalCreditsRequired}`],
    [`Status:`, student.status],
  ]

  studentInfo.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold")
    doc.text(label, margin, yPos)
    doc.setFont("helvetica", "normal")
    doc.text(value, margin + 40, yPos)
    yPos += 5
  })

  // Semester filter info
  if (selectedSemesterName && selectedSemesterName !== "All Semesters") {
    yPos += 3
    doc.setFont("helvetica", "bold")
    doc.text(`Semester: ${selectedSemesterName}`, margin, yPos)
    yPos += 5
  }

  yPos += 5
  doc.setFont("helvetica", "normal")
  doc.setFontSize(8)
  doc.text(`Generated on: ${currentDate}`, pageWidth - margin, yPos, { align: "right" })

  yPos += 10

  // Grades table
  if (filteredGrades.length > 0) {
    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("GRADES", margin, yPos)
    yPos += 5

    const tableData = filteredGrades.map((grade) => [
      grade.courseCode,
      grade.courseName,
      `${grade.score}%`,
      grade.letterGrade,
      grade.attendance !== null ? `${grade.attendance}%` : "N/A",
      `${grade.completed}/${grade.assignments}`,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Course Code", "Course Name", "Score", "Grade", "Attendance", "Assignments"]],
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
        2: { cellWidth: 20 }, // Score
        3: { cellWidth: 20 }, // Grade
        4: { cellWidth: 25 }, // Attendance
        5: { cellWidth: 25 }, // Assignments
      },
    })

    yPos = (doc as any).lastAutoTable.finalY + 10
  }

  // Enrollments table (if no grades or additional info needed)
  if (filteredEnrollments.length > 0 && filteredGrades.length === 0) {
    if (yPos > pageHeight - 60) {
      doc.addPage()
      yPos = margin
    }

    doc.setFontSize(11)
    doc.setFont("helvetica", "bold")
    doc.text("ENROLLED COURSES", margin, yPos)
    yPos += 5

    const enrollmentData = filteredEnrollments.map((enrollment) => [
      enrollment.courseCode,
      enrollment.courseName,
      enrollment.credits.toString(),
      enrollment.status,
    ])

    autoTable(doc, {
      startY: yPos,
      head: [["Course Code", "Course Name", "Credits", "Status"]],
      body: enrollmentData,
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
  const semesterSuffix = selectedSemesterName && selectedSemesterName !== "All Semesters"
    ? `_${selectedSemesterName.replace(/\s+/g, "_")}`
    : ""
  const filename = `Grades_${student.studentId}${semesterSuffix}_${new Date().toISOString().split("T")[0]}.pdf`

  // Save PDF
  doc.save(filename)
}

