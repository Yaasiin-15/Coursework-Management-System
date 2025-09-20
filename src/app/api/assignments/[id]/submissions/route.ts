import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Submission, { ISubmission } from "@/models/Submission";
import { verifyToken } from "@/lib/auth";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");

    if (!token) {
      return NextResponse.json({ error: "No token provided" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    await connectDB();

    let submissions: any[] = [];
    let userSubmission: any = null;

    if (decoded.role === "teacher" || decoded.role === "admin") {
      submissions = await Submission.find({ assignmentId: params.id })
        .populate("studentId", "name email")
        .sort({ submittedAt: -1 })
        .lean();
    } else {
      userSubmission = await Submission.findOne({
        assignmentId: params.id,
        studentId: decoded.userId,
      }).lean();
    }

    return NextResponse.json({
      success: true,
      submissions,
      userSubmission,
    });
  } catch (error) {
    console.error("Error fetching submissions:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
