import { redirect } from "next/navigation";

type Props = {
  params: Promise<{ courseId: string; lessonId: string }>;
};

export default async function LessonRedirectPage({ params }: Props) {
  const { courseId } = await params;

  redirect(`/learn/${courseId}`);
}
