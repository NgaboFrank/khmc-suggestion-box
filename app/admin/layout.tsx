import { currentAdmin } from '../../lib/admin-auth';
import AdminManagement from '../../components/AdminManagement';
import AdminSessionRefresh from '../../components/AdminSessionRefresh';

// There is exactly one owner account.
// Admin Management must never be shown to a normal administrator.
const OWNER_EMAIL = 'franckngabo70@gmail.com';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  const isOwner = admin?.email?.trim().toLowerCase() === OWNER_EMAIL;

  return (
    <>
      <AdminSessionRefresh />
      {children}
      <a className="adminForgotPassword" href="/admin/forgot-password">Forgot password?</a>
      {isOwner ? <AdminManagement /> : null}
      <style>{`body:has(.loginPage) .adminManagementButton{display:none!important}.loginForm{top:26.5%!important}.adminForgotPassword{display:none;position:fixed;z-index:20;left:calc(50% + 60px);top:calc(50% + 128px);width:min(440px,36vw);text-align:right;color:#2864e8;font-size:13px;font-weight:700;text-decoration:none}.adminForgotPassword:hover{text-decoration:underline}@media(max-width:760px){body:has(.loginPage) .loginForm{top:auto!important}body:has(.loginPage) .adminForgotPassword{position:fixed;left:auto;right:32px;top:auto;bottom:28px;width:auto;text-align:right}}body:has(.loginPage) .adminForgotPassword{display:block}`}</style>
    </>
  );
}
