export function PlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="page-section">
      <span className="eyebrow">Dashboard</span>
      <h1>{title}</h1>
      <p>{description}</p>
    </section>
  );
}
