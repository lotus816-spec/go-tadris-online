export default function Login() {
  return (
    <form method="post" action="/api/auth/callback/credentials" className="mx-auto max-w-sm space-y-3 py-10">
      <h1 className="text-2xl font-bold">تسجيل الدخول</h1>
      <input name="email" type="email" required placeholder="البريد" className="w-full rounded border p-2" />
      <input name="password" type="password" required placeholder="كلمة السر" className="w-full rounded border p-2" />
      <input type="hidden" name="csrfToken" value="" />
      <button className="w-full rounded bg-blue-700 py-2 text-white">دخول</button>
    </form>
  );
}
