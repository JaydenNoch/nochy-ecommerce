// Layout khusus login — override admin layout, tidak tampilkan admin header
export default function AdminLoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
