import { currentAdmin } from '../../lib/admin-auth';
import AdminManagement from '../../components/AdminManagement';

// There is exactly one owner account. Admin Management must never be shown
// to a normal administrator, even if their database role is misconfigured.
const OWNER_EMAIL = 'admin@khmc.com';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  const isOwner = admin?.email?.trim().toLowerCase() === OWNER_EMAIL;

  return <>
    {children}
    {isOwner ? <AdminManagement /> : null}
    <style>{`body:has(.loginPage) .adminManagementButton{display:none!important}`}</style>
  </>;
}
