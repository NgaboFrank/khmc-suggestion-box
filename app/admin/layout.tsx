import { currentAdmin } from '../../lib/admin-auth';
import AdminManagement from '../../components/AdminManagement';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  return <>
    {children}
    {admin?.is_owner ? <AdminManagement /> : null}
    <style>{`body:has(.loginPage) .adminManagementButton{display:none!important}`}</style>
  </>;
}
