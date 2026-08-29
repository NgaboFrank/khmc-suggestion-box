import { currentAdmin } from '../../lib/admin-auth';
import AdminManagement from '../../components/AdminManagement';

const OWNER_EMAIL = 'admin@khmc.com';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  const isOwner = Boolean(admin?.is_owner) && admin?.email?.toLowerCase() === OWNER_EMAIL;

  return <>
    {children}
    {isOwner ? <AdminManagement /> : null}
    <style>{`body:has(.loginPage) .adminManagementButton{display:none!important}`}</style>
  </>;
}
