export function ErrorMessage({
  message,
  title = 'Something went wrong',
}: {
  message: string;
  title?: string;
}) {
  return (
    <div className="alert alert-error" role="alert">
      <strong>{title}</strong>
      <span>{message}</span>
    </div>
  );
}
