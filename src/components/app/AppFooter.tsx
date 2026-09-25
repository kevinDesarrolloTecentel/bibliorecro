import { cibFacebook, cibInstagram, cibTwitter } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CFooter } from '@coreui/react-pro'
const AppFooter = () => {
  return (
    <CFooter className="px-4">
      <div className='text-center text-md-start'>
        <span className="ms-1">&copy; 2026 <strong> CC EL RECREO.</strong> <p>Todos los derechos reservados.</p></span>
      </div>
      <div className="text-center mb-3">
        <a className='fw-bold text-decoration-none text-gray-400 powered-by' href="https://es-la.facebook.com/ccelrecreo/">
          <span className="me-1"><strong> Powered By </strong></span>
          <div className="className">
            <span style={{ color: "rgba(4, 84, 134, 1)" }}><i><b>TECE</b></i></span>
            <span style={{ color: "rgb(55, 184, 204)" }}><i><b>NTEL S.A.</b></i></span>
          </div>
        </a>
      </div>
      <div className='text-center text-md-end'>
        <ul className='list-unstyled list-inline'>
          <li className="list-inline-item">
            <a href="https://es-la.facebook.com/ccelrecreo/">
              <CIcon icon={cibFacebook} size='lg' style={{ color: "rgb(55, 184, 204)" }} />
            </a>
          </li>
          <li className="list-inline-item">
            <a href="https://www.instagram.com/ccelrecreo/?hl=es-la">
              <CIcon icon={cibInstagram} size='lg' style={{ color: "rgb(55, 184, 204)" }} />
            </a>
          </li>
          <li className="list-inline-item">
            <a href="https://x.com/elrecreoquito?lang=en">
              <CIcon icon={cibTwitter} size='lg' style={{ color: "rgb(55, 184, 204)" }} />
            </a>
          </li>
        </ul>
      </div>
    </CFooter>
  )
}

export default AppFooter
