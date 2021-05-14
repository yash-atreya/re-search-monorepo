import { createContext, useContext, useEffect } from 'react';
import firebase from './config/firebase';
const AppContext = createContext();

export function AppWrapper({ children }) {
  let sharedState = {
      uid: null,
      token: null,
      user: null,
  }

  useEffect(() => {
      const unsub = firebase.auth().onAuthStateChanged(async user => {
          if(user) {
            sharedState.uid = user.uid;
            sharedState.user = user;
            sharedState.token = await user.getIdToken();
          } 
      });

      return unsub;
  }, []);
  return (
    <AppContext.Provider value={sharedState}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  return useContext(AppContext);
}