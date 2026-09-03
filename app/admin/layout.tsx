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
      <style>{`body:has(.loginPage) .adminManagementButton{display:none!important}.loginForm{top:26.5%!important}.adminForgotPassword{display:none;position:fixed;z-index:20;left:calc(50% + 60px);top:calc(50% + 128px);width:min(440px,36vw);text-align:right;color:#2864e8;font-size:13px;font-weight:700;text-decoration:none}.adminForgotPassword:hover{text-decoration:underline}@media(max-width:760px){body:has(.loginPage) .loginForm{top:auto!important}body:has(.loginPage) .adminForgotPassword{position:fixed;left:auto;right:32px;top:auto;bottom:28px;width:auto;text-align:right}}body:has(.loginPage) .adminForgotPassword{display:block}

/* KHMC admin dashboard polish */
body:has(.adminShell){background:#f4f7f5!important;color:#173b2b!important}
body:has(.adminShell) .adminShell{background:#f4f7f5!important}
body:has(.adminShell) .sidebar{width:252px!important;background:#ffffff!important;border-right:1px solid #e2ebe6!important;padding:22px 15px!important;box-shadow:4px 0 24px rgba(19,59,43,.035)!important}
body:has(.adminShell) .sidebarBrand{height:118px!important;padding:4px 10px 18px!important;margin-bottom:22px!important;border-bottom:1px solid #edf2ef!important}
body:has(.adminShell) .sidebarBrand img{width:188px!important;max-height:92px!important}
body:has(.adminShell) .sideLabel{font-size:10px!important;letter-spacing:.18em!important;color:#8b9992!important;padding:0 13px 10px!important}
body:has(.adminShell) .sidebar nav{gap:4px!important}
body:has(.adminShell) .navItem{min-height:43px!important;padding:10px 13px!important;border-radius:12px!important;color:#40584c!important;font-size:13px!important;transition:background .18s ease,border-color .18s ease,color .18s ease,transform .18s ease!important}
body:has(.adminShell) .navItem:hover{background:#f3f8f5!important;color:#087845!important;transform:translateX(2px)!important}
body:has(.adminShell) .navItem.active{background:#e9f7ef!important;border-color:#c7e8d5!important;color:#087845!important;box-shadow:inset 3px 0 0 #087845!important}
body:has(.adminShell) .navItem.selected{background:#f0f8f4!important;border-color:#d4eade!important;color:#087845!important}
body:has(.adminShell) .navIcon{font-size:14px!important;color:#718078!important}
body:has(.adminShell) .navItem.active .navIcon,body:has(.adminShell) .navItem.selected .navIcon{color:#087845!important}
body:has(.adminShell) .adminMain{margin-left:252px!important;width:calc(100% - 252px)!important;background:#f4f7f5!important}
body:has(.adminShell) .topbar{height:66px!important;padding:0 34px!important;background:rgba(255,255,255,.96)!important;border-bottom:1px solid #e0e9e4!important;box-shadow:0 1px 10px rgba(19,59,43,.025)!important}
body:has(.adminShell) .topContext{font-size:12px!important;color:#718078!important;font-weight:550!important}
body:has(.adminShell) .topActions{gap:16px!important}
body:has(.adminShell) .topActions a{font-size:12px!important;color:#087845!important;font-weight:800!important}
body:has(.adminShell) .online{font-size:11px!important;color:#687a71!important}
body:has(.adminShell) .logout{border-radius:9px!important;padding:8px 13px!important;background:#fff!important;border-color:#cbdad3!important;color:#087845!important;font-weight:750!important;transition:all .18s ease!important}
body:has(.adminShell) .logout:hover{background:#eff8f3!important;border-color:#acd4be!important;transform:none!important;box-shadow:none!important}
body:has(.adminShell) .content{max-width:1520px!important;padding:32px 40px 52px!important}
body:has(.adminShell) .dashboardHero{margin-bottom:24px!important;align-items:center!important}
body:has(.adminShell) .dashboardHero h1{font-size:38px!important;line-height:1.12!important;color:#123d2d!important;margin:7px 0 8px!important;font-weight:800!important}
body:has(.adminShell) .dashboardHero p{font-size:13px!important;color:#61736a!important;line-height:1.55!important}
body:has(.adminShell) .eyebrow{color:#087845!important;letter-spacing:.17em!important;font-size:10px!important;font-weight:850!important}
body:has(.adminShell) .outlineButton,body:has(.adminShell) .primaryButton{height:42px!important;padding:0 15px!important;border-radius:10px!important;font-size:11px!important}
body:has(.adminShell) .outlineButton{background:#fff!important;border-color:#cbdad3!important}
body:has(.adminShell) .primaryButton{background:#087845!important;box-shadow:0 7px 18px rgba(8,120,69,.16)!important}
body:has(.adminShell) .primaryButton:hover{background:#076c3e!important;box-shadow:0 9px 20px rgba(8,120,69,.2)!important;transform:translateY(-1px)!important}
body:has(.adminShell) .dashboardStats{gap:14px!important;margin-bottom:20px!important}
body:has(.adminShell) .statCard{min-height:125px!important;padding:19px 20px!important;border-radius:14px!important;border-color:#dce7e1!important;box-shadow:0 4px 16px rgba(19,59,43,.025)!important;transition:all .18s ease!important}
body:has(.adminShell) .statCard:hover{box-shadow:0 10px 25px rgba(19,59,43,.07)!important;transform:translateY(-2px)!important}
body:has(.adminShell) .statCard.active{background:#eff9f4!important;border-color:#8bcba8!important;box-shadow:0 8px 22px rgba(8,120,69,.08)!important}
body:has(.adminShell) .statLabel{font-size:11px!important;color:#64766d!important}
body:has(.adminShell) .statCard strong{font-size:32px!important;color:#103c2c!important;margin:8px 0 3px!important}
body:has(.adminShell) .statCard small{font-size:10px!important;color:#87958e!important}
body:has(.adminShell) .workspace{border-radius:15px!important;border-color:#dce7e1!important;box-shadow:0 8px 28px rgba(19,59,43,.045)!important}
body:has(.adminShell) .workspaceHead{padding:20px 22px 17px!important}
body:has(.adminShell) .workspaceHead h2{font-size:17px!important;color:#153f2f!important}
body:has(.adminShell) .workspaceHead p{font-size:10px!important;color:#829088!important}
body:has(.adminShell) .queueBadge{padding:7px 11px!important;background:#f0f8f4!important;border-color:#d8e9df!important;color:#4e6b5d!important}
body:has(.adminShell) .toolbar{grid-template-columns:minmax(240px,1fr) 205px 150px!important;padding:12px 22px!important;background:#fafcfb!important}
body:has(.adminShell) .searchBox,body:has(.adminShell) .toolbar select{border-color:#cfddd6!important;border-radius:9px!important}
body:has(.adminShell) .searchBox:focus-within{border-color:#6db18e!important;box-shadow:0 0 0 3px rgba(8,120,69,.07)!important}
body:has(.adminShell) th{padding:12px 16px!important;background:#f8faf9!important;color:#89968f!important;font-size:9px!important}
body:has(.adminShell) td{padding:15px 16px!important}
body:has(.adminShell) tbody tr{transition:background .15s ease!important}
body:has(.adminShell) tbody tr:hover{background:#f8fcfa!important}
body:has(.adminShell) .feedbackCell strong{color:#173e2f!important}
body:has(.adminShell) .departmentPill{background:#edf7f1!important;color:#21764e!important;border:1px solid #d9ede1!important}
body:has(.adminShell) .avatar{background:#e7f5ed!important;color:#087845!important;border:1px solid #d7ebe0!important}
body:has(.adminShell) .insights{gap:14px!important;margin-top:16px!important}
body:has(.adminShell) .insightCard{border-color:#dce7e1!important;border-radius:14px!important;box-shadow:0 5px 20px rgba(19,59,43,.03)!important}
body:has(.adminShell) footer{color:#96a29c!important}
@media(max-width:1100px){body:has(.adminShell) .content{padding:28px 24px 44px!important}body:has(.adminShell) .dashboardHero{align-items:flex-start!important}.dashboardStats{grid-template-columns:repeat(2,1fr)!important}.insights{grid-template-columns:1fr 1fr!important}}
@media(max-width:760px){body:has(.adminShell) .sidebar{position:relative!important;width:100%!important;height:auto!important;padding:14px!important}body:has(.adminShell) .sidebarBrand{height:78px!important}body:has(.adminShell) .adminMain{margin-left:0!important;width:100%!important}.dashboardStats{grid-template-columns:1fr!important}.insights{grid-template-columns:1fr!important}.dashboardHero{flex-direction:column!important}.toolbar{grid-template-columns:1fr!important}.content{padding:22px 16px 36px!important}.topbar{padding:0 16px!important}.topContext{display:none!important}}`}</style>
    </>
  );
}
