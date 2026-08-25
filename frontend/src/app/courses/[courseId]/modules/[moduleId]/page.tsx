import Link from 'next/link';
import { SectionItem } from '@/components/SectionItem';

export default async function ModuleDetailPage({
  params
}: {
  params: { courseId: string; moduleId: string }
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/modules/${params.moduleId}`);
  const moduleData = await res.json();
  
  const sectionsRes = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/modules/${params.moduleId}/sections`);
  const { sections } = await sectionsRes.json();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{moduleData.title}</h1>
        <p className="text-sm text-muted-foreground">{moduleData.description}</p>
      </div>
      
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Sections</h2>
        <div className="space-y-2">
          {sections.map((section) => (
            <Link key={section.id} href={`/courses/${params.courseId}/modules/${params.moduleId}/sections/${section.id}`} className="block">
              <SectionItem section={section} />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}