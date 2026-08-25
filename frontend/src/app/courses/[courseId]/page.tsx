import Link from 'next/link';
import { ModuleCard } from '@/components/library/ModuleCard';

export default async function CourseDetailPage({
  params
}: {
  params: { courseId: string }
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}`);
  const course = await res.json();
  
  const modulesRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/modules`);
  const { modules } = await modulesRes.json();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">{course.name}</h1>
        <p className="text-sm text-muted-foreground">{course.description}</p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Modules</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => (
            <Link key={module.id} href={`/courses/${params.courseId}/modules/${module.id}`} className="block">
              <ModuleCard module={module} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}