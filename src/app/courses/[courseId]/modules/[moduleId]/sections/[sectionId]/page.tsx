import Link from 'next/link';

export default async function SectionViewPage({
  params
}: {
  params: { 
    courseId: string; 
    moduleId: string; 
    sectionId: string 
  }
}) {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/courses/${params.courseId}/modules/${params.moduleId}/sections/${params.sectionId}`);
  const section = await res.json();

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">{section.title}</h1>
        <p className="text-sm text-muted-foreground">{section.description}</p>
      </div>
      
      {/* Video player if videoUrl exists */}
      {section.videoUrl && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Video</h2>
          <video controls className="rounded-lg w-full max-w-[640px]">
            <source src={section.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </div>
      )}
      
      {/* Markdown content if exists */}
      {section.markdownContent && (
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">Explanation</h2>
          <div className="prose prose-sm max-w-none">
            {/* In a real app, you'd use a markdown renderer here */}
            <div dangerouslySetInnerHTML={{ __html: section.markdownContent }} />
          </div>
        </div>
      )}
      
      {/* Metadata if exists */}
      {section.metadata && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-2">Metadata</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <h3 className="font-medium">Difficulty</h3>
              <p>{section.metadata.difficulty}</p>
            </div>
            <div>
              <h3 className="font-medium">Primary Style</h3>
              <p>{section.metadata.primaryStyle}</p>
            </div>
            {/* Add other metadata fields as needed */}
          </div>
        </div>
      )}
      
      <div className="mt-6 flex items-center space-x-4">
        <Link href={`/courses/${params.courseId}/modules/${params.moduleId}`} className="hover:underline">
          ← Back to Modules
        </Link>
        <Link href={`/courses/${params.courseId}`} className="hover:underline">
          ← Back to Course
        </Link>
        <Link href="/courses" className="ml-auto hover:underline">
          ← All Courses
        </Link>
      </div>
    </section>
  );
}
