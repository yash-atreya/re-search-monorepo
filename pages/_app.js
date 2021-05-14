import '../styles/globals.css'
import {AppWrapper} from '../context';
// const {auth} = firebase;
function MyApp({ Component, pageProps }) {
  return (
    <AppWrapper>
      <Component {...pageProps} />
    </AppWrapper>
  )
}

export default MyApp
