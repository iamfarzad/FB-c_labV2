// app/logout/page.tsx
export default function LogoutPage() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Log Out Page</h1>
      <p>This page is a placeholder. Clicking 'Log Out' might perform an action rather than navigate to a page in a real application.</p>
      <p>For now, this confirms the link works.</p>
      <p><a href="/chat" className="text-blue-500 hover:underline">Return to Chat</a></p>
    </div>
  );
}
