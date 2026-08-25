import Link from 'next/link';

interface CourseCardProps {
  course: {
    id: string;
    name: string;
    description?: string;
  };
}

export default function CourseCard({ course }: CourseCardProps) {
  return (
    <Link href={`/courses/${course.id}`} className="block rounded-2xl bg-surface-raised p-5 shadow-sm transition hover:shadow-md">
      <h3 className="text-lg font-semibold tracking-tight">{course.name}</h3>
      {course.description && (
        <p className="mt-1 text-sm text-muted-foreground">{course.description}</p>
      )}
    </Link>
  );
}