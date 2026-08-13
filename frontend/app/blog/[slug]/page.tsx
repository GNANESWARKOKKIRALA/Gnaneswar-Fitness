import BlogPostDetailClient from './BlogPostDetailClient';

export async function generateStaticParams() {
  return [
    { slug: 'master-progressive-overload-hypertrophy' },
    { slug: 'truth-about-fat-loss-caloric-deficit' }
  ];
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
  return <BlogPostDetailClient params={params} />;
}
