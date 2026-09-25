import AppContent from "@/components/app/AppContent"
import AppFooter from "@/components/app/AppFooter"
import AppHeader from "@/components/app/AppHeader"
import AppSidebar from "@/components/app/AppSidebar"

const DefaultLayout = () => {
  return (
    <>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1">
          <AppContent />
        </div>
        <AppFooter />
      </div>
    </>
  )
}

export default DefaultLayout
